import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SocialMediaService } from '@/lib/social-media-service';

// إنشاء عميل Supabase للتحقق من المستخدم
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * التحقق من المستخدم
 */
async function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * التحقق من صلاحيات المسؤول
 */
async function checkAdminPermission(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.role === 'admin';
}

/**
 * معالجة طلبات POST
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح به' }, { status: 401 });
    }

    // التحقق من صلاحيات المسؤول
    const isAdmin = await checkAdminPermission(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح به، يجب أن تكون مسؤولاً' }, { status: 403 });
    }

    const body = await req.json();
    const { action, id, data } = body;

    switch (action) {
      case 'createSocialMedia':
        const newSocialMedia = await SocialMediaService.createSocialMedia(data);
        return NextResponse.json({ success: true, socialMedia: newSocialMedia });

      case 'updateSocialMedia':
        if (!id) {
          return NextResponse.json({ error: 'معرف وسيلة التواصل مطلوب' }, { status: 400 });
        }
        const updatedSocialMedia = await SocialMediaService.updateSocialMedia(id, data);
        return NextResponse.json({ success: true, socialMedia: updatedSocialMedia });

      case 'deleteSocialMedia':
        if (!id) {
          return NextResponse.json({ error: 'معرف وسيلة التواصل مطلوب' }, { status: 400 });
        }
        await SocialMediaService.deleteSocialMedia(id);
        return NextResponse.json({ success: true });

      case 'toggleSocialMediaActive':
        if (!id) {
          return NextResponse.json({ error: 'معرف وسيلة التواصل مطلوب' }, { status: 400 });
        }
        const { is_active } = data;
        const toggledSocialMedia = await SocialMediaService.toggleSocialMediaActive(id, is_active);
        return NextResponse.json({ success: true, socialMedia: toggledSocialMedia });

      case 'reorderSocialMedia':
        const { socialMediaIds } = data;
        if (!socialMediaIds || !Array.isArray(socialMediaIds)) {
          return NextResponse.json({ error: 'قائمة معرفات وسائل التواصل مطلوبة' }, { status: 400 });
        }
        await SocialMediaService.reorderSocialMedia(socialMediaIds);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

/**
 * معالجة طلبات GET
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const id = url.searchParams.get('id');
    const isAdmin = url.searchParams.get('admin') === 'true';

    // للحصول على وسائل التواصل النشطة، لا نحتاج إلى التحقق من المستخدم
    if (action === 'getActiveSocialMedia' && !isAdmin) {
      const socialMedia = await SocialMediaService.getActiveSocialMedia();
      return NextResponse.json({ success: true, socialMedia });
    }

    // للإجراءات الأخرى، نحتاج إلى التحقق من المستخدم وصلاحياته
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح به' }, { status: 401 });
    }

    // التحقق من صلاحيات المسؤول للإجراءات الإدارية
    if (isAdmin) {
      const hasAdminPermission = await checkAdminPermission(user.id);
      if (!hasAdminPermission) {
        return NextResponse.json({ error: 'غير مصرح به، يجب أن تكون مسؤولاً' }, { status: 403 });
      }
    }

    switch (action) {
      case 'getAllSocialMedia':
        const allSocialMedia = await SocialMediaService.getAllSocialMedia();
        return NextResponse.json({ success: true, socialMedia: allSocialMedia });

      case 'getSocialMediaById':
        if (!id) {
          return NextResponse.json({ error: 'معرف وسيلة التواصل مطلوب' }, { status: 400 });
        }
        const socialMedia = await SocialMediaService.getSocialMediaById(id);
        return NextResponse.json({ success: true, socialMedia });

      default:
        return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
} 