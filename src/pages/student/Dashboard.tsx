import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import RecruiterDashboard from '../recruiter/RecruiterDashboard';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import ProjectFilePreviewHeader from '../../components/projects/ProjectFilePreviewHeader';
import { FolderKanban, ShieldCheck, Award, FileText, Sparkles, ExternalLink, Code2, ArrowRight, UserCheck } from 'lucide-react';
import type { VerificationStatus } from '../../types/database';

interface Project {
  id: string;
  title: string;
  description: string;
  demo_url?: string;
  github_url?: string;
  is_verified?: boolean;
  verification_status?: VerificationStatus;
  instructor?: string;
  project_type?: string;
  tags?: string[];
  created_at: string;
}

interface StudentProfileData {
  full_name?: string;
  major?: string;
  university?: string;
  gpa?: string;
  bio?: string;
  skills?: string[];
  avatar_url?: string;
}

interface CertificateData {
  id: string;
  title: string;
  issuer: string;
}

interface AchievementData {
  id: string;
  title: string;
}

interface InterviewFeedbackData {
  id: string;
  technical_score: number;
  soft_skills_score: number;
}

export default function Dashboard() {
  const { user, userRole } = useAuth();
  
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [feedbacks, setFeedbacks] = useState<InterviewFeedbackData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const [profileRes, projectsRes, certsRes, achsRes, fbsRes] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('projects').select('*').eq('student_id', user.id).order('created_at', { ascending: false }),
        supabase.from('certificates').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('achievements').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('interview_feedbacks').select('*').eq('student_id', user.id)
      ]);

      if (profileRes.data) setProfile(profileRes.data as StudentProfileData);
      if (projectsRes.data) setProjects(projectsRes.data as Project[]);
      if (certsRes.data) setCertificates(certsRes.data as CertificateData[]);
      if (achsRes.data) setAchievements(achsRes.data as AchievementData[]);
      if (fbsRes.data) setFeedbacks(fbsRes.data as InterviewFeedbackData[]);
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await fetchDashboardData();
      }
    };
    loadData();
  }, [user, fetchDashboardData]);

  // If recruiter role, render Recruiter Dashboard
  if (userRole === 'recruiter') {
    return <RecruiterDashboard />;
  }

  // If teacher role, render Teacher Portal Overview
  if (userRole === 'teacher') {
    return (
      <div style={{ padding: '30px', width: '100%', boxSizing: 'border-box' }}>
        <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#059669', letterSpacing: '1px', marginBottom: '4px' }}>ACADEMIC VERIFICATION PORTAL</div>
            <h1 style={{ margin: 0, fontSize: '26px', color: '#0f172a' }}>Xin chào, Giảng viên {user?.email?.split('@')[0]}</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Quản lý và cấp nhãn xác thực Verified Badge 🛡️ cho các đồ án của sinh viên thuộc bộ môn.</p>
          </div>
          <a href="/teacher/inbox" style={{ padding: '12px 20px', backgroundColor: '#059669', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            🛡️ Mở Hộp Thư Phê Duyệt Đồ Án →
          </a>
        </header>

        {/* Quick Teacher Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #d97706' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>⏳ ĐỒ ÁN ĐANG CHỜ DUYỆT</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>Hộp Thư Phê Duyệt</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Các đồ án được sinh viên chỉ định cho bạn</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #059669' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>🛡️ XÁC THỰC UY TÍN (VERIFIED)</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>Cấp Badge 🛡️</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Đảm bảo minh bạch năng lực cho recruiter</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>🎓 SINH VIÊN BỘ MÔN</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>Kết Nối Hướng Dẫn</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Đồng hành phát triển hồ sơ đồ án thực tế</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#047857' }}>Chuyển sang Hộp thư Phê duyệt để bắt đầu chấm điểm & cấp Badge</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#065f46' }}>Hệ thống đã tự động lọc nghiêm ngặt các đồ án do sinh viên gửi đích danh cho bạn.</p>
          <a href="/teacher/inbox" style={{ padding: '12px 24px', backgroundColor: '#047857', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', display: 'inline-block' }}>
            🛡️ Truy Cập Verification Inbox Ngay
          </a>
        </div>
      </div>
    );
  }

  // Calculate Dynamic Real Metrics
  const totalProjects = projects.length;
  const verifiedProjectsCount = projects.filter(p => p.is_verified || p.verification_status === 'verified').length;
  const pendingProjectsCount = projects.filter(p => p.verification_status === 'pending').length;
  const totalSkillsCount = profile?.skills?.length || 0;
  const totalCertsCount = certificates.length;
  const totalAchsCount = achievements.length;
  const totalFeedbacksCount = feedbacks.length;
  
  const avgTechScore = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, f) => acc + f.technical_score, 0) / feedbacks.length).toFixed(1)
    : 'Chưa có';

  // Calculate Profile Completion %
  let completion = 0;
  if (profile?.full_name) completion += 15;
  if (profile?.major) completion += 15;
  if (profile?.university) completion += 15;
  if (profile?.gpa) completion += 15;
  if (profile?.skills && profile.skills.length > 0) completion += 15;
  if (profile?.bio) completion += 15;
  if (totalProjects > 0) completion += 10;

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Sinh Viên';

  return (
    <div style={{ padding: '0', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Top Header */}
      <header style={{ height: '70px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          <span>Bảng Điều Khiển</span> <span style={{ margin: '0 8px' }}>/</span> <span style={{ color: '#0f172a', fontWeight: '500' }}>Sinh Viên Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontWeight: '600', color: '#1e3a8a', fontSize: '13px' }}>👨‍🎓 {displayName}</span>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Welcome Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '26px', color: '#0f172a', margin: '0 0 6px 0' }}>
              Xin chào, {displayName}! 👋
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              Xây dựng hồ sơ năng lực thực tế, nhận xác thực đồ án từ Giảng viên và kết nối AI tuyển dụng.
            </p>
          </div>
          <a
            href="/profile"
            style={{ padding: '10px 20px', backgroundColor: '#1e3a8a', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <UserCheck size={16} /> Xem Hồ Sơ Cá Nhân →
          </a>
        </div>

        {/* Dynamic Profile Completion Bar */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🛡️ Mức Độ Hoàn Thành Hồ Sơ: 
              <span style={{ backgroundColor: completion >= 80 ? '#059669' : '#1e3a8a', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>
                {completion}%
              </span>
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {completion >= 80 ? '✓ Hồ sơ của bạn đạt chuẩn tối ưu' : 'Bổ sung thêm thông tin để nâng cao cơ hội kết nối Nhà tuyển dụng'}
            </span>
          </div>
          <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ width: `${completion}%`, height: '100%', backgroundColor: completion >= 80 ? '#10b981' : '#f59e0b', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>

        {/* Dynamic Real Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '35px' }}>
          
          {/* Card 1: Projects */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FolderKanban size={16} color="#3b82f6" /> ĐỒ ÁN THỰC TẾ (REAL)
            </div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>
              {totalProjects < 10 ? `0${totalProjects}` : totalProjects}
            </div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: 'bold' }}>
              🛡️ {verifiedProjectsCount} đồ án đã Verified ({pendingProjectsCount} chờ duyệt)
            </div>
          </div>

          {/* Card 2: Skills */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#10b981" /> KỸ NĂNG ĐÃ ĐĂNG KÝ
            </div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>
              {totalSkillsCount < 10 ? `0${totalSkillsCount}` : totalSkillsCount}
            </div>
            <div style={{ fontSize: '12px', color: '#475569' }}>
              {profile?.skills && profile.skills.length > 0 ? profile.skills.slice(0, 2).join(', ') + '...' : 'Chưa nhập kỹ năng'}
            </div>
          </div>

          {/* Card 3: Certificates & Achievements */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #f59e0b', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} color="#f59e0b" /> CHỨNG CHỈ & THÀNH TÍCH
            </div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>
              {(totalCertsCount + totalAchsCount) < 10 ? `0${totalCertsCount + totalAchsCount}` : totalCertsCount + totalAchsCount}
            </div>
            <div style={{ fontSize: '12px', color: '#d97706' }}>
              {totalCertsCount} Chứng chỉ • {totalAchsCount} Giải thưởng
            </div>
          </div>

          {/* Card 4: Recruiter Feedbacks */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #8b5cf6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#8b5cf6" /> RECRUITER FEEDBACKS
            </div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>
              {totalFeedbacksCount < 10 ? `0${totalFeedbacksCount}` : totalFeedbacksCount}
            </div>
            <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 'bold' }}>
              Điểm kỹ thuật TB: {avgTechScore} / 10
            </div>
          </div>

        </div>

        {/* Quick Action Navigation Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '35px' }}>
          
          <a href="/cv-builder" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px', transition: 'transform 0.2s' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#1d4ed8', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <FileText size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e40af', marginBottom: '2px' }}>AI CV Builder (Dán JD)</div>
              <div style={{ fontSize: '12px', color: '#3b82f6' }}>Tự động chọn Đồ án Verified & trích xuất kỹ năng so khớp JD doanh nghiệp</div>
            </div>
            <ArrowRight size={18} color="#1d4ed8" />
          </a>

          <a href="/interview-prep" style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px', transition: 'transform 0.2s' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#7c3aed', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Sparkles size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#6d28d9', marginBottom: '2px' }}>🎯 Luyện Phỏng Vấn AI & Phân Tích Điểm Mù</div>
              <div style={{ fontSize: '12px', color: '#8b5cf6' }}>Sinh câu hỏi cá nhân hóa theo Đồ án Verified & nhận báo cáo Điểm mù kỹ năng</div>
            </div>
            <ArrowRight size={18} color="#7c3aed" />
          </a>

        </div>

        {/* Featured Projects List */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderKanban size={22} color="#1e3a8a" /> Danh Sách Đồ Án Thực Tế (Projects Real Data)
          </h2>
          <a href="/projects" style={{ color: '#1e3a8a', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Quản lý tất cả đồ án →
          </a>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>⏳ Đang tải dữ liệu thực tế từ Supabase...</p>
        ) : projects.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>Chưa có đồ án nào trong cơ sở dữ liệu.</p>
            <a href="/projects" style={{ padding: '10px 18px', backgroundColor: '#1e3a8a', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', display: 'inline-block' }}>
              + Thêm Đồ Án Mới Ngay
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
            {projects.slice(0, 3).map((proj) => (
              <div key={proj.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <ProjectFilePreviewHeader project={proj} />
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '4px' }}>
                        {proj.project_type || 'Đồ Án Môn Học'}
                      </span>
                      {proj.is_verified || proj.verification_status === 'verified' ? (
                        <VerifiedBadge teacherName={proj.instructor} size="sm" />
                      ) : (
                        <span style={{ fontSize: '10px', color: '#d97706', backgroundColor: '#fffbeb', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fef3c7' }}>
                          ⏳ {proj.verification_status === 'pending' ? 'Chờ duyệt' : 'Chưa duyệt'}
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a', lineHeight: '1.4' }}>
                      {proj.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '15px', lineHeight: '1.5' }}>
                      {proj.description || 'Chưa có mô tả đồ án.'}
                    </p>
                  </div>

                  <div>
                    {/* Tags */}
                    {proj.tags && proj.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '15px' }}>
                        {proj.tags.slice(0, 3).map((t, idx) => (
                          <span key={idx} style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '4px' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Project Links */}
                    <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      {proj.demo_url && (
                        <a href={proj.demo_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ExternalLink size={12} /> Demo
                        </a>
                      )}
                      {proj.github_url && (
                        <a href={proj.github_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#475569', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Code2 size={12} /> Source Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}