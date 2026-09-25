import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { getSharedJobs, getRecruiterCompanyProfile } from '../../utils/jobSync';
import { addToSharedPipeline } from '../../utils/pipelineSync';
import RecruiterCompanyModal from '../../components/student/RecruiterCompanyModal';
import { Search, Briefcase, MapPin, Building2, Send, Info, CheckCircle2 } from 'lucide-react';
import type { JobPost } from '../../types/database';

export default function StudentJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobPost | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  useEffect(() => {
    const loadJobs = () => {
      const allJobs = getSharedJobs();
      setJobs(allJobs);
    };

    loadJobs();
    window.addEventListener('storage', loadJobs);
    window.addEventListener('focus', loadJobs);
    return () => {
      window.removeEventListener('storage', loadJobs);
      window.removeEventListener('focus', loadJobs);
    };
  }, []);

  const handleApplyJob = (job: JobPost) => {
    const newItem = {
      id: 'p_' + Date.now(),
      recruiter_id: job.recruiter_id || 'rec1',
      student_id: user?.id || 'std_curr',
      stage: 'discovered' as const,
      student: {
        id: user?.id || 'std_curr',
        full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sinh Viên Ứng Tuyển',
        major: 'Công Nghệ Thông Tin',
        university: 'Đại Học Bách Khoa',
        gpa: '3.6 / 4.0',
        skills: ['ReactJS', 'TypeScript', 'Node.js', 'Git']
      },
      private_notes: `Ứng tuyển trực tiếp từ bài đăng tuyển dụng: ${job.title}`
    };

    addToSharedPipeline(newItem, job.recruiter_id);
    setAppliedJobIds(prev => [...prev, job.id]);
    alert(`🎉 Ứng tuyển thành công vị trí: ${job.title}!\nHồ sơ Verified của bạn đã được chuyển tới Nhà tuyển dụng.`);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.required_skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        marginBottom: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            💼 Bài Đăng Tuyển Dụng Doanh Nghiệp (Realtime Feed)
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            Khám phá các vị trí tuyển dụng thực tập & làm việc được đăng tải trực tiếp từ Nhà tuyển dụng đối tác.
          </p>
        </div>
        <div style={{ fontSize: '13px', fontWeight: 'bold', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '6px 14px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          ✨ {jobs.length} Vị Trí Đang Mở
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '25px' }}>
        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm theo vị trí tuyển dụng, phòng ban hoặc kỹ năng (VD: ReactJS, Figma, UI/UX)..."
          style={{
            width: '100%',
            padding: '14px 16px 14px 46px',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        />
      </div>

      {/* Job Grid / List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredJobs.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            Chưa có bài đăng tuyển dụng nào phù hợp với từ khóa tìm kiếm.
          </div>
        ) : (
          filteredJobs.map(job => {
            const recruiterProfile = getRecruiterCompanyProfile(job.recruiter_id);
            const isApplied = appliedJobIds.includes(job.id);

            return (
              <div
                key={job.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '22px 24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease, boxShadow 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
                      {job.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#475569' }}>
                      <span style={{ fontWeight: 'bold', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={15} /> {recruiterProfile.companyName}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Briefcase size={14} /> {job.department || 'Công nghệ thông tin'}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: '500' }}>
                        <MapPin size={14} /> {job.location || 'TP. Hồ Chí Minh'}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    🟢 Đang Tuyển Dụng
                  </span>
                </div>

                {/* Job Description */}
                <p style={{ fontSize: '13px', color: '#334155', margin: '0 0 14px 0', lineHeight: '1.6' }}>
                  {job.description}
                </p>

                {/* Skills Chips */}
                {job.required_skills && job.required_skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', alignSelf: 'center', fontWeight: 'bold', marginRight: '4px' }}>Yêu cầu:</span>
                    {job.required_skills.map((skill, idx) => (
                      <span key={idx} style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Buttons */}
                <div style={{ display: 'flex', gap: '12px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => setSelectedJobForModal(job)}
                    style={{
                      padding: '9px 16px',
                      backgroundColor: '#f8fafc',
                      color: '#1e3a8a',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Info size={15} /> Thông Tin HR & Công Ty
                  </button>

                  <button
                    onClick={() => handleApplyJob(job)}
                    disabled={isApplied}
                    style={{
                      padding: '9px 20px',
                      backgroundColor: isApplied ? '#ecfdf5' : '#1e3a8a',
                      color: isApplied ? '#047857' : 'white',
                      border: isApplied ? '1px solid #a7f3d0' : 'none',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 'bold',
                      cursor: isApplied ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: isApplied ? 'none' : '0 2px 4px rgba(30, 58, 138, 0.2)'
                    }}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 size={15} /> Đã Nộp Hồ Sơ
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Ứng Tuyển Ngay
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recruiter / Company Profile Modal */}
      {selectedJobForModal && (
        <RecruiterCompanyModal
          recruiterId={selectedJobForModal.recruiter_id}
          jobTitle={selectedJobForModal.title}
          onClose={() => setSelectedJobForModal(null)}
        />
      )}

    </div>
  );
}
