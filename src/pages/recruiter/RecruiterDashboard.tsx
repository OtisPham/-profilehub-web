import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import RecruiterFeedbackModal from '../../components/recruiter/RecruiterFeedbackModal';
import {
  Users,
  Briefcase,
  Kanban,
  Star,
  Sparkles,
  TrendingUp,
  Mail,
  FileText,
  ExternalLink,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  MapPin,
  MessageSquarePlus,
  Trash2,
  RotateCcw
} from 'lucide-react';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import { getSharedPipeline } from '../../utils/pipelineSync';

interface TalentCandidate {
  id: string;
  full_name: string;
  university?: string;
  major?: string;
  gpa?: string;
  email?: string;
  bio?: string;
  skills?: string[];
  verified_projects_count: number;
  projects: Array<{
    id: string;
    title: string;
    description?: string;
    demo_url?: string;
    instructor?: string;
    is_verified?: boolean;
  }>;
}

interface UpcomingInterviewItem {
  id: string;
  student_id: string;
  student_name: string;
  major: string;
  interview_date: string;
  interview_time: string;
  meeting_link: string;
  interview_location: string;
  interview_status?: string;
  notes?: string;
}

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<TalentCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCvCandidate, setSelectedCvCandidate] = useState<TalentCandidate | null>(null);

  // Recruiter Dashboard Metrics
  const [stats, setStats] = useState({
    totalTalentPool: 128,
    activeJobs: 4,
    shortlistedCandidates: 24,
    scheduledInterviews: 8,
    hiredCandidates: 2
  });

  // Feedback Modal State
  const [feedbackCandidate, setFeedbackCandidate] = useState<{ id: string; full_name?: string; major?: string } | null>(null);

  // Upcoming Interviews List & Calendar Filter
  const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterviewItem[]>([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchTalentData = async () => {
      setLoading(true);
      try {
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .or('verification_status.eq.verified,is_verified.eq.true');

        if (projectsData && projectsData.length > 0) {
          const studentIds = Array.from(new Set(projectsData.map(p => p.student_id).filter(Boolean)));

          const [{ data: profilesData }, { data: usersData }] = await Promise.all([
            supabase.from('student_profiles').select('*').in('id', studentIds),
            supabase.from('users').select('id, email, full_name').in('id', studentIds)
          ]);

          const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);
          const userMap = new Map(usersData?.map(u => [u.id, u]) || []);

          const formatted: TalentCandidate[] = studentIds.map(sId => {
            const profile = profileMap.get(sId);
            const userData = userMap.get(sId);
            const studentProjects = projectsData.filter(p => p.student_id === sId);

            return {
              id: sId,
              full_name: profile?.full_name || userData?.full_name || 'Ứng viên Sinh viên',
              university: profile?.university || 'Đại Học Bách Khoa',
              major: profile?.major || 'Công Nghệ Thông Tin',
              gpa: profile?.gpa || '3.7 / 4.0',
              email: userData?.email || '',
              bio: profile?.bio || 'Sinh viên đam mê phát triển phần mềm và xây dựng sản phẩm chất lượng cao.',
              skills: profile?.skills || ['ReactJS', 'TypeScript', 'Node.js', 'Git', 'Tailwind'],
              verified_projects_count: studentProjects.length,
              projects: studentProjects.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                demo_url: p.demo_url,
                instructor: p.instructor,
                is_verified: true
              }))
            };
          });

          setCandidates(formatted);

          // Fetch dynamic stats from recruiter tables & localStorage fallback
          const localJobs = JSON.parse(localStorage.getItem(`jobs_${user?.id || 'default'}`) || '[]');
          const localPipeline = getSharedPipeline(user?.id);

          const { data: dbJobs } = await supabase.from('recruiter_jobs').select('id');
          const { data: dbPipeline } = await supabase.from('recruiter_pipeline').select('stage');

          const activeJobsCount = (dbJobs && dbJobs.length > 0) ? dbJobs.length : (localJobs.length > 0 ? localJobs.length : 4);
          const pipelineData = (dbPipeline && dbPipeline.length > 0) ? dbPipeline : localPipeline;

          const shortlistedCount = pipelineData.filter((p: { stage?: string }) => p.stage === 'shortlisted').length || 24;
          const interviewCount = pipelineData.filter((p: { stage?: string }) => p.stage === 'interview').length || 8;
          const hiredCount = pipelineData.filter((p: { stage?: string }) => p.stage === 'hired').length || 2;

          setStats({
            totalTalentPool: formatted.length > 0 ? formatted.length : 128,
            activeJobs: activeJobsCount,
            shortlistedCandidates: shortlistedCount,
            scheduledInterviews: interviewCount,
            hiredCandidates: hiredCount
          });

          // Load scheduled interviews from pipeline
          const scheduledFromPipeline = localPipeline.filter((p: any) => p.stage === 'interview' || p.interview_date).map((p: any) => ({
            id: p.id,
            student_id: p.student_id,
            student_name: p.student?.full_name || 'Ứng viên Sinh viên',
            major: p.student?.major || 'Công Nghệ Thông Tin',
            interview_date: p.interview_date || '2026-09-26',
            interview_time: p.interview_time || '10:00 AM',
            meeting_link: p.meeting_link || 'https://meet.google.com/abc-defg-hij',
            interview_location: p.interview_location || 'Online (Google Meet)',
            interview_status: p.interview_status || 'confirmed',
            notes: p.private_notes
          }));

          if (scheduledFromPipeline.length > 0) {
            setUpcomingInterviews(scheduledFromPipeline);
          } else {
            setUpcomingInterviews([]);
          }

        } else {
          setCandidates([]);
          setUpcomingInterviews([]);
        }
      } catch (err) {
        console.error("Recruiter dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTalentData();

    const handleSync = () => {
      fetchTalentData();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [user?.id]);

  const handleDeleteInterview = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy / xóa lịch phỏng vấn này không?')) {
      const updated = upcomingInterviews.filter(iv => iv.id !== id);
      setUpcomingInterviews(updated);

      const localPipeline = JSON.parse(localStorage.getItem(`pipeline_${user?.id || 'default'}`) || '[]');
      const updatedPipeline = localPipeline.map((p: any) => p.id === id ? {
        ...p,
        interview_date: undefined,
        interview_time: undefined,
        meeting_link: undefined,
        interview_location: undefined
      } : p);
      localStorage.setItem(`pipeline_${user?.id || 'default'}`, JSON.stringify(updatedPipeline));
    }
  };

  // Filtered interviews list by calendar date
  const filteredInterviews = selectedCalendarDate
    ? upcomingInterviews.filter(iv => iv.interview_date === selectedCalendarDate)
    : upcomingInterviews;

  // Calendar dates with interviews
  const scheduledDatesSet = new Set(upcomingInterviews.map(iv => iv.interview_date));

  return (
    <div style={{ padding: '0', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Top Professional Header */}
        <header style={{ height: '70px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Portal Nhà Tuyển Dụng</span>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>Executive Talent Command Center</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#8b5cf6', backgroundColor: '#f5f3ff', padding: '4px 12px', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
              🏢 Nhà Tuyển Dụng Enterprise
            </span>
            <span style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>{user?.email}</span>
          </div>
        </header>

        {/* Dashboard Content Body */}
        <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Welcome Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>
                Chào buổi sáng, {user?.email?.split('@')[0]}
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Tổng quan kho tài năng sinh viên đã được Giảng viên xác thực & Tiến trình quản lý tuyển dụng.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href="/recruiter/ai-assistant"
                style={{ padding: '10px 18px', backgroundColor: '#8b5cf6', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)' }}
              >
                <Sparkles size={16} /> AI Tuyển Dụng Smart
              </a>

              <a
                href="/recruiter/pipeline"
                style={{ padding: '10px 18px', backgroundColor: '#1e3a8a', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Kanban size={16} /> Mở Pipeline
              </a>
            </div>
          </div>

          {/* Candidate Confirmation Notification Alert Banner */}
          {upcomingInterviews.some(i => i.interview_status === 'confirmed') && (
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#065f46' }}>
                    🎉 Thông báo xác nhận phỏng vấn từ ứng viên!
                  </div>
                  <div style={{ fontSize: '13px', color: '#047857', marginTop: '2px' }}>
                    Ứng viên <strong>{upcomingInterviews.filter(i => i.interview_status === 'confirmed').map(i => i.student_name).join(', ')}</strong> đã xác nhận tham gia lịch phỏng vấn!
                  </div>
                </div>
              </div>
              <a href="/recruiter/pipeline" style={{ backgroundColor: '#059669', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
                Xem Pipeline →
              </a>
            </div>
          )}

          {/* 1. Executive Recruitment KPI Cockpit (5 Metrics) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '30px' }}>
            
            <div style={{ backgroundColor: 'white', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #1e3a8a', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kho Ứng Viên Verified</span>
                <Users size={18} color="#1e3a8a" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{stats.totalTalentPool}</div>
              <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <TrendingUp size={12} /> +14% tuần này
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #8b5cf6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vị Trí Đang Đăng Tuyển</span>
                <Briefcase size={18} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>0{stats.activeJobs}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Đang mở tuyển dụng</div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đã Shortlist (Pipeline)</span>
                <Kanban size={18} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{stats.shortlistedCandidates}</div>
              <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px', fontWeight: 'bold' }}>Sẵn sàng phỏng vấn</div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #f59e0b', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lịch Phỏng Vấn Tuần</span>
                <Mail size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>0{stats.scheduledInterviews}</div>
              <div style={{ fontSize: '11px', color: '#d97706', marginTop: '4px', fontWeight: 'bold' }}>8 ứng viên xác nhận</div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đã Tuyển Thành Công</span>
                <CheckCircle2 size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>0{stats.hiredCandidates}</div>
              <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 'bold' }}>Thành công tháng này</div>
            </div>

          </div>

          {/* 2. Asymmetric Row: AI Command Bar (70%) + Pipeline Stream (30%) */}
          <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '20px', marginBottom: '30px' }}>
            
            {/* AI Command Center Box */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="#8b5cf6" /> AI Recruitment Command Bar
                </div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#f5f3ff', color: '#8b5cf6', padding: '3px 10px', borderRadius: '12px' }}>
                  Tự động Khớp & Phân tích
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                Nhập câu văn tự nhiên về yêu cầu vị trí tuyển dụng để AI tìm kiếm và sắp xếp các ứng viên có đồ án Verified phù hợp nhất.
              </p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    readOnly
                    onClick={() => window.location.href = '/recruiter/ai-assistant'}
                    placeholder="VD: Cần tuyển thực tập sinh UI/UX biết Figma, có 2 đồ án thực tế tại TP.HCM..."
                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', cursor: 'pointer', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>
                <a
                  href="/recruiter/ai-assistant"
                  style={{ padding: '12px 20px', backgroundColor: '#1e3a8a', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  ⚡ Khớp AI →
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569' }}>
                <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>Kỹ năng phổ biến trong kho talent:</span>
                <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>ReactJS (42)</span>
                <span style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Figma (38)</span>
                <span style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>TypeScript (31)</span>
                <span style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Python (24)</span>
              </div>
            </div>

            {/* Mini Pipeline Stream */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>📊 Tiến Trình Pipeline</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                    <span style={{ color: '#64748b' }}>Ứng viên mới:</span>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>45 ứng viên</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 10px', backgroundColor: '#eff6ff', borderRadius: '6px' }}>
                    <span style={{ color: '#1d4ed8' }}>Đã Shortlist:</span>
                    <span style={{ fontWeight: 'bold', color: '#1d4ed8' }}>24 ứng viên</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 10px', backgroundColor: '#f5f3ff', borderRadius: '6px' }}>
                    <span style={{ color: '#8b5cf6' }}>Lịch phỏng vấn:</span>
                    <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>{upcomingInterviews.length} ứng viên</span>
                  </div>
                </div>
              </div>

              <a
                href="/recruiter/pipeline"
                style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', textDecoration: 'none', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '12px', display: 'block' }}
              >
                Mở Bảng Kanban Chi Tiết →
              </a>
            </div>

          </div>

          {/* 2.5 Upcoming Interview Schedule + Mini Monthly Calendar Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '6.8fr 3.2fr', gap: '20px', marginBottom: '30px' }}>
            
            {/* Left: Upcoming Interview Cards List */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} color="#7c3aed" /> 📅 Lịch Phỏng Vấn Sắp Tới (Upcoming Interviews)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Danh sách lịch phỏng vấn ứng viên đã xác nhận. Chọn ngày trên Lịch tháng để lọc nhanh.
                  </p>
                </div>

                {selectedCalendarDate ? (
                  <button
                    onClick={() => setSelectedCalendarDate(null)}
                    style={{ padding: '6px 12px', backgroundColor: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RotateCcw size={12} /> Xem tất cả ({upcomingInterviews.length})
                  </button>
                ) : (
                  <a
                    href="/recruiter/pipeline"
                    style={{ padding: '6px 12px', backgroundColor: '#f5f3ff', color: '#7c3aed', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #ddd6fe' }}
                  >
                    <Kanban size={14} /> Mở Pipeline →
                  </a>
                )}
              </div>

              {filteredInterviews.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '12px', color: '#94a3b8', fontSize: '13px' }}>
                  Chưa có lịch phỏng vấn nào vào ngày <strong style={{ color: '#7c3aed' }}>{selectedCalendarDate}</strong>.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                  {filteredInterviews.map(iv => (
                    <div key={iv.id} style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>{iv.student_name}</div>
                            <div style={{ fontSize: '12px', color: '#6b21a8', fontWeight: '500' }}>🎓 {iv.major}</div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {iv.interview_status === 'confirmed' ? (
                              <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>✅ SV Đã Xác Nhận</span>
                            ) : iv.interview_status === 'pending_student' ? (
                              <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '10px', border: '1px solid #fde68a' }}>⏳ Chờ SV Xác Nhận</span>
                            ) : (
                              <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#d8b4fe', color: '#581c87', padding: '2px 8px', borderRadius: '10px' }}>📅 Đã Lên Lịch</span>
                            )}
                            <button
                              onClick={() => handleDeleteInterview(iv.id)}
                              title="Hủy / Xóa cuộc hẹn này"
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#374151', marginBottom: '12px', backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #f3e8ff' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#6b21a8' }}>
                            <Clock size={14} /> {iv.interview_date} lúc {iv.interview_time}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563' }}>
                            <MapPin size={14} /> {iv.interview_location}
                          </div>
                          {iv.notes && (
                            <div style={{ fontSize: '11px', color: '#92400e', fontStyle: 'italic', marginTop: '2px' }}>
                              📝 {iv.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e9d5ff', paddingTop: '12px' }}>
                        <a
                          href={iv.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          style={{ flex: 1, padding: '8px', backgroundColor: '#7c3aed', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Video size={14} /> Vào Meet
                        </a>
                        <button
                          onClick={() => setFeedbackCandidate({ id: iv.student_id, full_name: iv.student_name, major: iv.major })}
                          style={{ padding: '8px 12px', backgroundColor: '#ffffff', color: '#7c3aed', border: '1px solid #c084fc', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <MessageSquarePlus size={14} /> Feedback
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Mini Monthly Calendar Component */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={18} color="#7c3aed" /> Lịch Tháng 9 / 2026
                  </span>
                  <span style={{ fontSize: '11px', backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {scheduledDatesSet.size} ngày có lịch
                  </span>
                </div>

                {/* Day of Week Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textAlign: 'center' }}>
                  <div>T2</div>
                  <div>T3</div>
                  <div>T4</div>
                  <div>T5</div>
                  <div>T6</div>
                  <div>T7</div>
                  <div style={{ color: '#ef4444' }}>CN</div>
                </div>

                {/* Calendar Days Grid (September 2026 starting on T3 - 1st is Tuesday) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {/* Empty cell for Monday Aug 31 */}
                  <div style={{ padding: '8px 0', textAlign: 'center', fontSize: '11px', color: '#cbd5e1' }}>31</div>

                  {Array.from({ length: 30 }, (_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `2026-09-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                    const hasSchedule = scheduledDatesSet.has(dateStr);
                    const isSelected = selectedCalendarDate === dateStr;

                    return (
                      <button
                        key={dayNum}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCalendarDate(null);
                          } else {
                            setSelectedCalendarDate(dateStr);
                          }
                        }}
                        style={{
                          padding: '8px 0',
                          textAlign: 'center',
                          fontSize: '12px',
                          fontWeight: hasSchedule || isSelected ? 'bold' : 'normal',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #7c3aed' : '1px solid transparent',
                          backgroundColor: isSelected
                            ? '#7c3aed'
                            : hasSchedule
                            ? '#f3e8ff'
                            : '#f8fafc',
                          color: isSelected
                            ? '#ffffff'
                            : hasSchedule
                            ? '#6b21a8'
                            : '#334155',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {dayNum}
                        {hasSchedule && !isSelected && (
                          <span style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#7c3aed', borderRadius: '50%' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend & Reset button */}
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#f3e8ff', border: '1px solid #c084fc', borderRadius: '50%' }} /> Ngày có hẹn phỏng vấn
                </div>
                {selectedCalendarDate && (
                  <button
                    onClick={() => setSelectedCalendarDate(null)}
                    style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                  >
                    Hủy lọc
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* 3. Verified Talent Feed */}
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>
                🛡️ Hồ Sơ Sinh Viên Tài Năng Đã Xác Thực (Verified Talent)
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Ứng viên được Giảng viên đánh giá và kiểm định bài báo cáo / đồ án thực tế.
              </p>
            </div>

            <a href="/recruiter/search" style={{ fontSize: '13px', fontWeight: 'bold', color: '#3b82f6', textDecoration: 'none' }}>
              Xem toàn bộ kho tài năng →
            </a>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', color: '#64748b' }}>
              ⏳ Đang tải ứng viên tài năng...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {candidates.map(candidate => (
                <div key={candidate.id} style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <div>
                    {/* Header candidate */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                          {candidate.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ margin: '0 0 2px 0', fontSize: '16px', color: '#0f172a' }}>{candidate.full_name}</h3>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>🎓 {candidate.university}</div>
                        </div>
                      </div>

                      <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                        🎯 GPA: {candidate.gpa}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', fontWeight: 'bold', marginBottom: '10px' }}>
                      Chuyên ngành: {candidate.major}
                    </div>

                    {/* Bio */}
                    {candidate.bio && (
                      <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {candidate.bio}
                      </p>
                    )}

                    {/* Skills */}
                    {candidate.skills && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                        {candidate.skills.slice(0, 4).map((sk, idx) => (
                          <span key={idx} style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px' }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Verified Project Highlight */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Đồ án nổi bật đã xác thực:</div>
                      {candidate.projects.slice(0, 1).map(p => (
                        <div key={p.id}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{p.title}</span>
                            <VerifiedBadge teacherName={p.instructor} size="sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <button
                      onClick={() => {
                        const localSaved = JSON.parse(localStorage.getItem(`saved_candidates_${user?.id || 'default'}`) || '[]');
                        const alreadySaved = localSaved.some((s: { student_id?: string }) => s.student_id === candidate.id);
                        if (alreadySaved) {
                          alert(`Ứng viên ${candidate.full_name} đã có trong danh sách Đã Lưu!`);
                        } else {
                          const newSaved = {
                            id: `sc_${Date.now()}`,
                            recruiter_id: user?.id || 'rec1',
                            student_id: candidate.id,
                            folder_name: 'Shortlist Tiềm Năng',
                            student: candidate,
                            created_at: new Date().toISOString()
                          };
                          localStorage.setItem(`saved_candidates_${user?.id || 'default'}`, JSON.stringify([...localSaved, newSaved]));
                          alert(`Đã lưu ứng viên ${candidate.full_name} vào thư mục Shortlist!`);
                        }
                      }}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <Star size={14} color="#f59e0b" /> Lưu Hồ Sơ
                    </button>

                    <button
                      onClick={() => setSelectedCvCandidate(candidate)}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <FileText size={14} /> Xem Full Portfolio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      {/* Modal Recruiter Feedback Loop */}
      {feedbackCandidate && (
        <RecruiterFeedbackModal
          isOpen={!!feedbackCandidate}
          onClose={() => setFeedbackCandidate(null)}
          candidate={feedbackCandidate}
        />
      )}

      {/* Modal Quick View Candidate CV / Verified Portfolio */}
      {selectedCvCandidate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '24px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#0f172a' }}>
                  📄 Hồ Sơ Ứng Viên Verified: {selectedCvCandidate.full_name}
                </h2>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {selectedCvCandidate.university} • Chuyên ngành {selectedCvCandidate.major}
                </div>
              </div>
              <button
                onClick={() => setSelectedCvCandidate(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '30px' }}>
              
              {/* Profile Summary */}
              <div style={{ marginBottom: '24px', backgroundColor: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', textTransform: 'uppercase', marginBottom: '6px' }}>Giới thiệu ứng viên</div>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: '1.6' }}>
                  {selectedCvCandidate.bio}
                </p>
              </div>

              {/* Skills */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kỹ năng & Công nghệ chính</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedCvCandidate.skills?.map((sk, idx) => (
                    <span key={idx} style={{ fontSize: '12px', backgroundColor: '#f1f5f9', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects List */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đồ án thực tế đã kiểm định (Verified Projects)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {selectedCvCandidate.projects.map(p => (
                    <div key={p.id} style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>{p.title}</span>
                        {p.is_verified && <VerifiedBadge teacherName={p.instructor} size="md" />}
                      </div>

                      {p.description && (
                        <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                          {p.description}
                        </p>
                      )}

                      {p.demo_url && (
                        <a href={p.demo_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          🔗 Xem Demo trực tuyến / Báo cáo đồ án <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '20px 30px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderRadius: '0 0 16px 16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setSelectedCvCandidate(null)}
                style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Đóng
              </button>
              <a
                href={`mailto:${selectedCvCandidate.email}?subject=Mời%20Phỏng%20Vấn%20Tuyển%20Dụng&body=Chào%20${selectedCvCandidate.full_name},%20chúng%20tôi%20rất%20ấn%20tượng%20với%20hồ%20sơ%20verified%20của%20bạn...`}
                style={{ padding: '10px 20px', backgroundColor: '#1e3a8a', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Mail size={16} /> Gửi Email Phỏng Vấn
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
