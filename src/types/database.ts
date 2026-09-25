export type UserRole = 'student' | 'recruiter' | 'teacher';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  bio?: string;
  created_at?: string;
}

export interface StudentProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  major?: string;
  university?: string;
  gpa?: string;
  skills?: string[];
  username?: string;
  qr_code_url?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  student_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  demo_url?: string;
  github_url?: string;
  figma_url?: string;
  doc_url?: string;
  project_type?: string;
  score?: string;
  is_verified?: boolean;
  role?: string;
  team_size?: string;
  instructor?: string;
  tags?: string[];
  image_url?: string;
  verification_status?: VerificationStatus;
  verified_by?: string;
  teacher_feedback?: string;
  verified_at?: string;
  verification_code?: string;
  verification_hash?: string;
  created_at?: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
  created_at?: string;
}

export interface ProjectSkill {
  project_id: string;
  skill_id: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  category?: string;
  date_awarded?: string;
  rank?: string;
  description?: string;
  is_featured?: boolean;
  image_url?: string;
  created_at?: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  category: string;
  level?: string;
  date_awarded?: string;
  description?: string;
  is_featured?: boolean;
  verified?: boolean;
  image_url?: string;
  created_at?: string;
}

export interface GeneratedCV {
  id: string;
  student_id: string;
  target_job_title: string;
  target_jd_text: string;
  match_score: number;
  summary_text?: string;
  selected_projects?: string[];
  selected_certificates?: string[];
  selected_skills?: string[];
  created_at?: string;
}

export type PipelineStage = 'discovered' | 'shortlisted' | 'contacted' | 'interview' | 'hired';

export interface JobPost {
  id: string;
  recruiter_id: string;
  title: string;
  department?: string;
  location?: string;
  required_skills?: string[];
  description?: string;
  status?: 'active' | 'closed';
  created_at?: string;
}

export interface SavedCandidate {
  id: string;
  recruiter_id: string;
  student_id: string;
  folder_name: string;
  created_at?: string;
  student?: StudentProfile;
}

export interface CandidatePipelineItem {
  id: string;
  recruiter_id: string;
  student_id: string;
  job_id?: string;
  stage: PipelineStage;
  private_notes?: string;
  interview_date?: string;
  interview_time?: string;
  meeting_link?: string;
  interview_location?: string;
  interview_status?: 'pending_student' | 'confirmed' | 'completed' | 'cancelled' | 'scheduled';
  created_at?: string;
  updated_at?: string;
  student?: StudentProfile;
  job?: JobPost;
}

export interface InterviewFeedback {
  id: string;
  recruiter_id: string;
  recruiter_name?: string;
  company_name?: string;
  student_id: string;
  job_id?: string;
  technical_score: number;
  soft_skills_score: number;
  recruiter_comment: string;
  blind_spots: string[];
  created_at?: string;
}