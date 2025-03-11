import { NextRequest, NextResponse } from 'next/server';
import { BoltService } from '@/lib/bolt-service';
import { createClient } from '@supabase/supabase-js';

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
 * معالجة طلبات POST
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح به' }, { status: 401 });
    }

    const body = await req.json();
    const { action, projectId, data } = body;

    switch (action) {
      case 'createProject':
        const { name, description } = data;
        const newProject = await BoltService.createProject(user.id, name, description);
        return NextResponse.json({ success: true, project: newProject });

      case 'updateProject':
        if (!projectId) {
          return NextResponse.json({ error: 'معرف المشروع مطلوب' }, { status: 400 });
        }
        await BoltService.updateProjectData(projectId, user.id, data);
        return NextResponse.json({ success: true });

      case 'getProject':
        if (!projectId) {
          return NextResponse.json({ error: 'معرف المشروع مطلوب' }, { status: 400 });
        }
        const project = await BoltService.getProjectById(projectId, user.id);
        return NextResponse.json({ success: true, project });

      case 'getUserProjects':
        const projects = await BoltService.getUserProjects(user.id);
        return NextResponse.json({ success: true, projects });

      case 'deleteProject':
        if (!projectId) {
          return NextResponse.json({ error: 'معرف المشروع مطلوب' }, { status: 400 });
        }
        await BoltService.deleteProject(projectId, user.id);
        return NextResponse.json({ success: true });

      case 'publishWebsite':
        if (!projectId) {
          return NextResponse.json({ error: 'معرف المشروع مطلوب' }, { status: 400 });
        }
        await BoltService.publishWebsite(projectId, user.id);
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
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح به' }, { status: 401 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const projectId = url.searchParams.get('projectId');

    switch (action) {
      case 'getUserProjects':
        const projects = await BoltService.getUserProjects(user.id);
        return NextResponse.json({ success: true, projects });

      case 'getProject':
        if (!projectId) {
          return NextResponse.json({ error: 'معرف المشروع مطلوب' }, { status: 400 });
        }
        const project = await BoltService.getProjectById(projectId, user.id);
        return NextResponse.json({ success: true, project });

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