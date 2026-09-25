import type { JobPost } from '../types/database';

const JOBS_SHARED_KEY = 'jobs_shared_data';

export interface RecruiterCompanyProfile {
  recruiterName: string;
  companyName: string;
  industry: string;
  companySize: string;
  companyAddress: string;
  website: string;
  phone: string;
  companyBio: string;
  email?: string;
}

export const getSharedJobs = (): JobPost[] => {
  const shared = localStorage.getItem(JOBS_SHARED_KEY);
  if (shared) {
    try {
      const parsed = JSON.parse(shared);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback
    }
  }

  // Check default key
  const defaultJobs = localStorage.getItem('jobs_default');
  if (defaultJobs) {
    try {
      const parsed = JSON.parse(defaultJobs);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback
    }
  }

  // Default initial jobs
  return [
    {
      id: 'j1',
      recruiter_id: 'rec1',
      title: 'Thực tập sinh ReactJS / Fullstack Developer',
      department: 'Công nghệ thông tin',
      location: 'TP. Hồ Chí Minh',
      required_skills: ['ReactJS', 'TypeScript', 'Node.js', 'Git', 'Tailwind'],
      description: 'Tuyển dụng thực tập sinh tham gia dự án phần mềm doanh nghiệp. Yêu cầu có các đồ án thực tế đã Verified trên ProfileHub.',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'j2',
      recruiter_id: 'rec2',
      title: 'Thực tập sinh UI/UX Product Designer',
      department: 'Thiết kế sản phẩm',
      location: 'TP. Hồ Chí Minh (Hybrid)',
      required_skills: ['Figma', 'UI/UX', 'User Research', 'Prototyping'],
      description: 'Xây dựng thiết kế giao diện quy chuẩn Design System cho các ứng dụng di động & website học tập trực tuyến.',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];
};

export const saveSharedJobs = (jobs: JobPost[], userId?: string) => {
  const jsonStr = JSON.stringify(jobs);
  localStorage.setItem(JOBS_SHARED_KEY, jsonStr);
  localStorage.setItem('jobs_default', jsonStr);
  if (userId) {
    localStorage.setItem(`jobs_${userId}`, jsonStr);
  }
  window.dispatchEvent(new Event('storage'));
};

export const getRecruiterCompanyProfile = (recruiterId?: string): RecruiterCompanyProfile => {
  const local = recruiterId ? localStorage.getItem(`recruiter_profile_${recruiterId}`) : null;
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // Fallback
    }
  }

  // Default fallback profile
  return {
    recruiterName: 'Trần Thị Mai Phương',
    companyName: 'TechCorp Solutions Vietnam',
    industry: 'Công Nghệ Thông Tin & Phần Mềm',
    companySize: '100 - 500 nhân viên',
    companyAddress: 'Tòa nhà Innovation, Tầng 12, Quận 1, TP. Hồ Chí Minh',
    website: 'https://techcorp.example.com',
    phone: '028 3822 9999',
    companyBio: 'TechCorp Solutions là tập đoàn công nghệ hàng đầu chuyên phát triển các giải pháp chuyển đổi số, phần mềm quản trị doanh nghiệp và ứng dụng trí tuệ nhân tạo (AI). Chúng tôi liên kết trực tiếp với ProfileHub để tìm kiếm các tài năng sinh viên xuất sắc.',
    email: 'hr@techcorp.example.com'
  };
};
