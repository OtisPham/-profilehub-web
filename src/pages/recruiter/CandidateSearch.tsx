import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import { Search, ShieldCheck, Mail, FileText, ExternalLink, Code2 } from 'lucide-react';
import VSCodeViewerModal from '../../components/common/VSCodeViewerModal';

interface VerifiedStudentCandidate {
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
    github_url?: string;
    figma_url?: string;
    doc_url?: string;
    instructor?: string;
    is_verified?: boolean;
    score?: string;
    role?: string;
  }>;
}

export default function CandidateSearch() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<VerifiedStudentCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyVerified, setOnlyVerified] = useState(true);

  // Modal xem Full CV
  const [selectedCvCandidate, setSelectedCvCandidate] = useState<VerifiedStudentCandidate | null>(null);
  const [inspectGitHubUrl, setInspectGitHubUrl] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Lấy danh sách đồ án đã xác thực
      let query = supabase.from('projects').select('*');
      if (onlyVerified) {
        query = query.or('verification_status.eq.verified,is_verified.eq.true');
      }

      const { data: projectsData } = await query;

      if (!projectsData || projectsData.length === 0) {
        setCandidates([]);
        setLoading(false);
        return;
      }

      const studentIds = Array.from(new Set(projectsData.map(p => p.student_id).filter(Boolean)));

      if (studentIds.length === 0) {
        setCandidates([]);
        setLoading(false);
        return;
      }

      // 2. Lấy thông tin sinh viên & user
      const [{ data: profilesData }, { data: usersData }] = await Promise.all([
        supabase.from('student_profiles').select('*').in('id', studentIds),
        supabase.from('users').select('id, email, full_name').in('id', studentIds)
      ]);

      const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      const userMap = new Map(usersData?.map(u => [u.id, u]) || []);

      const candidateList: VerifiedStudentCandidate[] = studentIds.map(sId => {
        const profile = profileMap.get(sId);
        const userData = userMap.get(sId);
        const studentProjects = projectsData.filter(p => p.student_id === sId);

        return {
          id: sId,
          full_name: profile?.full_name || userData?.full_name || userData?.email?.split('@')[0] || 'Ứng viên Sinh viên',
          university: profile?.university || 'Đại Học Bách Khoa',
          major: profile?.major || 'Công Nghệ Thông Tin',
          gpa: profile?.gpa || '3.6 / 4.0',
          email: userData?.email || '',
          bio: profile?.bio || '',
          skills: profile?.skills || ['React', 'TypeScript', 'Node.js', 'Git'],
          verified_projects_count: studentProjects.filter(p => p.is_verified || p.verification_status === 'verified').length,
          projects: studentProjects.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            demo_url: p.demo_url,
            instructor: p.instructor,
            is_verified: p.is_verified || p.verification_status === 'verified',
            score: p.score,
            role: p.role
          }))
        };
      });

      setCandidates(candidateList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [onlyVerified]);

  useEffect(() => {
    const loadData = async () => {
      await fetchCandidates();
    };
    loadData();
  }, [fetchCandidates]);

  const filteredCandidates = candidates.filter(c => {
    const text = `${c.full_name} ${c.university} ${c.major} ${c.gpa} ${c.skills?.join(' ')} ${c.projects.map(p => p.title).join(' ')}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ padding: '0', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header */}
        <header style={{ height: '70px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Portal Nhà Tuyển Dụng</span>
            <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
            <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>Candidate Talent Search</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#8b5cf6', backgroundColor: '#f5f3ff', padding: '4px 12px', borderRadius: '12px' }}>
              🏢 Nhà Tuyển Dụng
            </span>
            <span style={{ fontSize: '13px', color: '#475569' }}>{user?.email}</span>
          </div>
        </header>

        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ marginBottom: '25px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8b5cf6', letterSpacing: '1px', marginBottom: '5px' }}>VERIFIED TALENT REPOSITORY</div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '26px', color: '#0f172a' }}>Tìm Kiếm Ứng Viên Được Giảng Viên Xác Thực</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Tiếp cận hồ sơ sinh viên tài năng kèm đồ án thực tế đã qua kiểm định chất lượng 100%.</p>
          </div>

          {/* Thanh Tìm Kiếm & Bộ Lọc */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} color="#64748b" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tìm kiếm ứng viên theo Tên, Trường, Chuyên ngành, GPA, Kỹ năng (React, Python...)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={e => setOnlyVerified(e.target.checked)}
              />
              🛡️ Chỉ xem Ứng viên có đồ án Verified
            </label>
          </div>

          {/* Danh Sách Ứng Viên */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', color: '#64748b' }}>
              ⏳ Đang tải dữ liệu ứng viên tiềm năng...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div style={{ padding: '50px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#0f172a' }}>Không tìm thấy ứng viên phù hợp</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc xem đồ án Verified.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px' }}>
              {filteredCandidates.map(candidate => (
                <div key={candidate.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                  
                  {/* Header Candidate */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                        {candidate.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', color: '#0f172a' }}>{candidate.full_name}</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                          <span>🎓 {candidate.university} • {candidate.major}</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                            🎯 GPA: {candidate.gpa}
                          </span>
                        </div>
                      </div>
                    </div>

                    {candidate.verified_projects_count > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                        <ShieldCheck size={14} /> {candidate.verified_projects_count} Verified
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {candidate.bio && (
                    <p style={{ fontSize: '12px', color: '#475569', marginBottom: '15px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {candidate.bio}
                    </p>
                  )}

                  {/* Kỹ năng */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '15px' }}>
                      {candidate.skills.map(s => (
                        <span key={s} style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '4px' }}>{s}</span>
                      ))}
                    </div>
                  )}

                  {/* Đồ án Verified Tiêu biểu */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Đồ án nổi bật đã xác thực:</div>
                    {candidate.projects.slice(0, 2).map(p => (
                      <div key={p.id} style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px dashed #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a' }}>{p.title}</span>
                          {p.is_verified && <VerifiedBadge teacherName={p.instructor} size="sm" />}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                          {p.github_url && (
                            <button
                              onClick={() => setInspectGitHubUrl(p.github_url || null)}
                              style={{ padding: '3px 8px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            >
                              <Code2 size={11} color="#38bdf8" /> Duyệt GitHub Code (VS Code)
                            </button>
                          )}
                          {p.demo_url && (
                            <a href={p.demo_url} target="_blank" rel="noreferrer" style={{ fontSize: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '4px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              🌐 Demo ↗
                            </a>
                          )}
                          {p.figma_url && (
                            <a href={p.figma_url} target="_blank" rel="noreferrer" style={{ fontSize: '10px', backgroundColor: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8', padding: '2px 6px', borderRadius: '4px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              🎨 Figma ↗
                            </a>
                          )}
                          {p.doc_url && (
                            <a href={p.doc_url} target="_blank" rel="noreferrer" style={{ fontSize: '10px', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 6px', borderRadius: '4px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              📄 Spec Doc ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          const localSaved = JSON.parse(localStorage.getItem(`saved_candidates_${user?.id || 'default'}`) || '[]');
                          const alreadySaved = localSaved.some((s: { student_id?: string }) => s.student_id === candidate.id);
                          if (alreadySaved) {
                            alert(`Ứng viên ${candidate.full_name} đã có trong danh sách Đã Lưu!`);
                          } else {
                            const newSaved = {
                              id: 'sc_' + Date.now(),
                              recruiter_id: user?.id || 'rec1',
                              student_id: candidate.id,
                              folder_name: candidate.major || 'Ứng viên tiềm năng',
                              created_at: new Date().toISOString(),
                              student: { id: candidate.id, full_name: candidate.full_name, major: candidate.major, university: candidate.university, gpa: candidate.gpa, skills: candidate.skills }
                            };
                            localStorage.setItem(`saved_candidates_${user?.id || 'default'}`, JSON.stringify([...localSaved, newSaved]));
                            alert(`⭐ Đã lưu ứng viên ${candidate.full_name} vào thư mục!`);
                          }
                        }}
                        style={{ flex: 1, padding: '8px', backgroundColor: '#f5f3ff', color: '#8b5cf6', border: '1px solid #ddd6fe', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        ⭐ Lưu Hồ Sơ
                      </button>

                      <button
                        onClick={() => {
                          const localPipeline = JSON.parse(localStorage.getItem(`pipeline_${user?.id || 'default'}`) || '[]');
                          const alreadyIn = localPipeline.some((p: { student_id?: string }) => p.student_id === candidate.id);
                          if (alreadyIn) {
                            alert(`Ứng viên ${candidate.full_name} đã có trong Pipeline!`);
                          } else {
                            const newItem = {
                              id: 'p_' + Date.now(),
                              recruiter_id: user?.id || 'rec1',
                              student_id: candidate.id,
                              stage: 'discovered',
                              student: { id: candidate.id, full_name: candidate.full_name, major: candidate.major, university: candidate.university, gpa: candidate.gpa, skills: candidate.skills },
                              private_notes: 'Tìm thấy từ trang Search'
                            };
                            localStorage.setItem(`pipeline_${user?.id || 'default'}`, JSON.stringify([...localPipeline, newItem]));
                            alert(`📊 Đã thêm ${candidate.full_name} vào cột Ứng viên mới (Pipeline)!`);
                          }
                        }}
                        style={{ flex: 1, padding: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        📊 Thêm vào Pipeline
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`mailto:${candidate.email}?subject=Mời%20Phỏng%20Vấn%20Tuyển%20Dụng&body=Chào%20${candidate.full_name},%20chúng%20tôi%20đã%20xem%20hồ%20sơ%20verified%20của%20bạn...`}
                        style={{ flex: 1, padding: '10px', backgroundColor: '#1e3a8a', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Mail size={14} /> Mời Phỏng Vấn
                      </a>

                      <button
                        onClick={() => setSelectedCvCandidate(candidate)}
                        style={{ padding: '10px 16px', backgroundColor: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileText size={14} /> Full CV
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      {/* MODAL XEM FULL CV ỨNG VIÊN */}
      {selectedCvCandidate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            {/* Modal Header */}
            <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '25px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ffffff', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px', border: '3px solid #60a5fa' }}>
                  {selectedCvCandidate.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', color: 'white' }}>{selectedCvCandidate.full_name}</h2>
                  <div style={{ fontSize: '13px', color: '#93c5fd', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>🎓 {selectedCvCandidate.university}</span>
                    <span>•</span>
                    <span>{selectedCvCandidate.major}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCvCandidate(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>✖</button>
            </div>

            {/* Modal Content / Detailed CV Body */}
            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Highlight Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Điểm GPA Học Tập</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#047857', marginTop: '2px' }}>🎯 {selectedCvCandidate.gpa}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Đồ án Verified</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1d4ed8', marginTop: '2px' }}>🛡️ {selectedCvCandidate.verified_projects_count} đồ án</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Liên hệ Email</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>✉️ {selectedCvCandidate.email || 'Chưa cập nhật'}</div>
                </div>
              </div>

              {/* Bio Section */}
              {selectedCvCandidate.bio && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Giới thiệu bản thân (About)</h4>
                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: 0, backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    {selectedCvCandidate.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kỹ năng chuyên môn (Technical Skills)</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedCvCandidate.skills?.map((sk, idx) => (
                    <span key={idx} style={{ fontSize: '12px', fontWeight: 'bold', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '20px', border: '1px solid #bfdbfe' }}>
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

                      {p.role && <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Vai trò: {p.role}</div>}

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

      {/* VS Code Theme Inspector Modal */}
      <VSCodeViewerModal
        isOpen={Boolean(inspectGitHubUrl)}
        onClose={() => setInspectGitHubUrl(null)}
        githubUrl={inspectGitHubUrl}
      />
    </div>
  );
}
