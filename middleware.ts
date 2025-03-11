import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// تحديد المسارات العامة التي لا تتطلب مصادقة
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/callback',
  '/auth/check-email',
  '/auth/forgot-password',
  '/api',
  '/api/webhook',
];

// تعطيل الوسيط مؤقتًا للتطوير
const DISABLE_MIDDLEWARE = true;

export async function middleware(req: NextRequest) {
  // تجاهل الطلبات إلى الملفات الثابتة
  const path = req.nextUrl.pathname;
  if (
    path.includes('_next') ||
    path.includes('favicon') ||
    path.includes('images') ||
    path.includes('fonts') ||
    path.includes('api') ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  // التحقق من المسارات العامة
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(publicPath + '/')
  );
  
  // إذا كان المسار عامًا، السماح بالوصول
  if (isPublicPath) {
    return NextResponse.next();
  }

  // تعطيل الوسيط مؤقتًا للتطوير
  if (DISABLE_MIDDLEWARE) {
    console.log(`Middleware disabled: Path=${path}`);
    return NextResponse.next();
  }

  try {
    // إنشاء استجابة أولية
    const res = NextResponse.next();
    
    // إنشاء عميل Supabase للوسيط
    const supabase = createMiddlewareClient({ req, res });
    
    // التحقق من الجلسة
    const { data: { session } } = await supabase.auth.getSession();
    
    // طباعة معلومات التصحيح
    console.log(`Middleware: Path=${path}, Session=${session ? 'Active' : 'None'}, User=${session?.user?.email || 'None'}`);
    
    // إذا لم تكن هناك جلسة، إعادة التوجيه إلى صفحة تسجيل الدخول
    if (!session) {
      // تخزين المسار الحالي للعودة إليه بعد تسجيل الدخول
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirectedFrom', path);
      return NextResponse.redirect(redirectUrl);
    }
    
    // التحقق من دور المستخدم للمسارات الإدارية
    if (path.startsWith('/admin')) {
      try {
        // الحصول على ملف المستخدم
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        // إذا لم يكن المستخدم مسؤولًا، إعادة التوجيه إلى لوحة التحكم
        if (!profile || profile.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        // في حالة حدوث خطأ، السماح بالوصول والاعتماد على التحقق في الواجهة
        return res;
      }
    }
    
    // إضافة معلومات المستخدم إلى الرأس للاستخدام في الواجهة
    res.headers.set('x-user-id', session.user.id);
    res.headers.set('x-user-email', session.user.email || '');
    res.headers.set('x-user-authenticated', 'true');
    
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // في حالة حدوث خطأ، السماح بالوصول والاعتماد على التحقق في الواجهة
    return NextResponse.next();
  }
}

// تكوين الوسيط ليعمل على جميع المسارات
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 