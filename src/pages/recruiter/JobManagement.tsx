import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import type { JobPost } from '../../types/database';
import { Plus, MapPin, Building, Users, CheckCircle } from 'lucide-react';
import { getSharedJobs, saveSharedJobs } from '../../utils/jobSync';

export default function JobManagement() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Công nghệ thông tin');
  const [location, setLocation] = useState('TP. Hồ Chí Minh');
  const [skillsInput, setSkillsInput] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { data: dbJobs, error } = await supabase.from('recruiter_jobs').select('*').order('created_at', { ascending: false });

        if (!error && dbJobs && dbJobs.length > 0) {
          setJobs(dbJobs);
          saveSharedJobs(dbJobs, user?.id);
        } else {
          const shared = getSharedJobs();
          setJobs(shared);
        }
      } catch (err) {
        console.error("Fetch jobs error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(s => s !== '');
    const newJob: JobPost = {
      id: 'job_' + Date.now(),
      recruiter_id: user?.id || 'rec1',
      title,
      department,
      location,
      required_skills: skillsArray,
      description,
      status: 'active',
      created_at: new Date().toISOString()
    };

    try {
      if (user?.id) {
        await supabase.from('recruiter_jobs').insert([{
          recruiter_id: user.id,
          title,
          department,
          location,
          required_skills: skillsArray,
          description,
          status: 'active'
        }]);
      }
    } catch (err) {
      console.warn("DB insert error, falling back to local:", err);
    }

    const updated = [newJob, ...jobs];
    setJobs(updated);
    saveSharedJobs(updated, user?.id);

    // Reset form & close modal
    setTitle('');
    setSkillsInput('');
    setDescription('');
    setShowCreateModal(false);
  };

  return (
    <div style={{ padding: '30px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
              💼 Quản Lý Vị Trí Tuyển Dụng (Jobs)
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              Đăng tuyển dụng mới và theo dõi lượng ứng viên nộp hồ sơ cho từng vị trí.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{ padding: '10px 20px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Đăng Vị Trí Tuyển Dụng Mới
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Đang tải tin tuyển dụng...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {jobs.map(job => (
              <div key={job.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={12} /> Đang mở đăng tuyển
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {job.created_at ? new Date(job.created_at).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
                    {job.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '13px', marginBottom: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={14} /> {job.department}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {job.location}
                    </span>
                  </div>

                  <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5', margin: '0 0 14px 0' }}>
                    {job.description}
                  </p>

                  {job.required_skills && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {job.required_skills.map((sk, idx) => (
                        <span key={idx} style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: '500' }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} /> Ứng viên: Active
                  </span>
                  <a href="/recruiter/pipeline" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>
                    Xem Pipeline →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Đăng Tuyển Dụng Mới */}
        {showCreateModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>💼 Đăng Vị Trí Tuyển Dụng Mới</h2>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
              </div>

              <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Tên vị trí công việc *</label>
                  <input
                    required
                    type="text"
                    placeholder="VD: Thực tập sinh ReactJS Frontend..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Phòng ban / Mảng</label>
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Địa điểm làm việc</label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Kỹ năng bắt buộc (cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="VD: ReactJS, TypeScript, Git, Tailwind..."
                    value={skillsInput}
                    onChange={e => setSkillsInput(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Mô tả công việc & Yêu cầu đồ án</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Mô tả công việc và các tiêu chí đồ án thực tế mong muốn ở ứng viên..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '10px 20px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Đăng vị trí công việc
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
