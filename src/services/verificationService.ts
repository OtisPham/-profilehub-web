import { supabase } from './supabase';

export interface PublicVerificationRecord {
  verification_code: string;
  verification_hash: string;
  verified_at: string;
  project: {
    id: string;
    title: string;
    description?: string;
    project_type?: string;
    demo_url?: string;
    github_url?: string;
    figma_url?: string;
    doc_url?: string;
    tags?: string[];
    thumbnail_url?: string;
    teacher_feedback?: string;
    score?: string;
  };
  student: {
    full_name: string;
    university: string;
    major: string;
    avatar_url?: string;
  };
  teacher: {
    full_name: string;
    email: string;
    bio?: string;
  };
}

/**
 * Generate a unique verification code in format PH-VER-XXXXXX
 */
export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 8; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PH-VER-${randomStr}`;
}

/**
 * Generate a hash string for verification payload integrity
 */
export function generateVerificationHash(projectId: string, studentId: string, teacherId: string, timestamp: string): string {
  const payload = `${projectId}:${studentId}:${teacherId}:${timestamp}`;
  let hash = 5381;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash * 33) ^ payload.charCodeAt(i);
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  return `0x${hexHash}${timestamp.substring(0, 10).replace(/-/g, '')}`;
}

/**
 * Fetch a public verification record by verificationCode
 */
export async function getPublicVerificationRecord(verificationCode: string): Promise<PublicVerificationRecord | null> {
  if (!verificationCode || verificationCode.trim() === '') return null;

  const codeClean = verificationCode.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(codeClean);

  // 1. Fetch project safely without triggering Postgres UUID syntax error (HTTP 400)
  let query = supabase.from('projects').select('*');
  if (isUuid) {
    query = query.or(`verification_code.eq.${codeClean},id.eq.${codeClean}`);
  } else {
    query = query.eq('verification_code', codeClean);
  }

  const { data: project, error: projError } = await query.maybeSingle();

  if (projError || !project) {
    if (projError) console.error("Lỗi khi tra cứu bản ghi xác thực:", projError.message);
    return null;
  }

  // Chấp nhận nếu verification_status === 'verified' HOẶC is_verified === true
  const isVerified = project.verification_status === 'verified' || project.is_verified === true;
  if (!isVerified) {
    return null;
  }

  // 2. Fetch student info
  const [{ data: studentProfile }, { data: studentUser }] = await Promise.all([
    supabase.from('student_profiles').select('full_name, university, major, avatar_url').eq('id', project.student_id).maybeSingle(),
    supabase.from('users').select('full_name, email, avatar_url').eq('id', project.student_id).maybeSingle()
  ]);

  // 3. Fetch teacher info
  let teacherUser: { full_name?: string; email?: string; bio?: string } | null = null;
  if (project.verified_by) {
    const { data: teacherData } = await supabase
      .from('users')
      .select('full_name, email, bio')
      .eq('id', project.verified_by)
      .maybeSingle();
    teacherUser = teacherData;
  }

  const studentName = studentProfile?.full_name || studentUser?.full_name || 'Sinh viên ProfileHub';
  const university = studentProfile?.university || 'Đại học Bách Khoa';
  const major = studentProfile?.major || 'Công nghệ thông tin';

  const teacherName = teacherUser?.full_name || project.instructor || 'Giảng viên Hướng dẫn';
  const teacherEmail = teacherUser?.email || 'teacher@profilehub.edu.vn';

  const verCode = project.verification_code || codeClean;
  const verifiedAt = project.verified_at || project.created_at || new Date().toISOString();
  const verHash = project.verification_hash || generateVerificationHash(project.id, project.student_id, project.verified_by || 'teacher', verifiedAt);

  return {
    verification_code: verCode,
    verification_hash: verHash,
    verified_at: verifiedAt,
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      project_type: project.project_type,
      demo_url: project.demo_url,
      github_url: project.github_url,
      figma_url: project.figma_url,
      doc_url: project.doc_url,
      tags: project.tags,
      thumbnail_url: project.thumbnail_url || project.image_url,
      teacher_feedback: project.teacher_feedback,
      score: project.score
    },
    student: {
      full_name: studentName,
      university,
      major,
      avatar_url: studentProfile?.avatar_url || studentUser?.avatar_url
    },
    teacher: {
      full_name: teacherName,
      email: teacherEmail,
      bio: teacherUser?.bio
    }
  };
}
