import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // تبادل الرمز للحصول على جلسة
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('خطأ في تبادل الرمز للحصول على جلسة:', error);
        return NextResponse.redirect(new URL('/auth/login?error=auth_error', request.url));
      }
      
      console.log('Session created successfully:', data.session?.user?.email);
      
      // التحقق من نوع الطلب (تسجيل، إعادة تعيين كلمة المرور، إلخ)
      const type = requestUrl.searchParams.get('type');
      
      // التحقق من دور المستخدم لتوجيهه إلى الصفحة المناسبة
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        
        const isAdmin = profile?.role === 'admin';
        const redirectPath = isAdmin ? '/admin' : '/dashboard';
        
        // إضافة معلمة success للإشارة إلى نجاح العملية
        if (type === 'recovery') {
          return NextResponse.redirect(new URL('/auth/reset-password?success=recovery', request.url));
        } else if (type === 'signup') {
          return NextResponse.redirect(new URL(`${redirectPath}?success=signup`, request.url));
        } else {
          // إعادة التوجيه إلى لوحة التحكم مع رسالة نجاح
          return NextResponse.redirect(new URL(`${redirectPath}?success=email_verified`, request.url));
        }
      }
    } catch (error) {
      console.error('خطأ في معالجة رمز المصادقة:', error);
      return NextResponse.redirect(new URL('/auth/login?error=auth_error', request.url));
    }
  }

  // إعادة التوجيه إلى الصفحة الرئيسية أو لوحة التحكم إذا لم يكن هناك رمز
  return NextResponse.redirect(new URL(next, request.url));
} 