import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import type { VerificationStatus } from '../../types/database';
import { generateVerificationCode, generateVerificationHash } from '../../services/verificationService';
import VSCodeViewerModal from '../../components/common/VSCodeViewerModal';

interface PendingProject {
  id: string;
  student_id: string;
  title: string;
  description?: string;
  project_type?: string;
  score?: string;
  instructor?: string;
  verified_by?: string;
  is_verified?: boolean;
  demo_url?: string;
  github_url?: string;
  figma_url?: string;
  doc_url?: string;
  tags?: string[];
  verification_status?: VerificationStatus;
  teacher_feedback?: string;
  created_at?: string;
  student?: {
    full_name?: string;
    email?: string;
    university?: string;
    major?: string;
  };
}

const DEFAULT_PRESETS = [
  { id: 'def-1', label: '⚡ Đạt yêu cầu xác thực', text: 'Đồ án đạt yêu cầu xác thực, kiến trúc mã nguồn rõ ràng và đáp ứng tốt mục tiêu môn học.' },
  { id: 'def-2', label: '⚡ Hoàn thành xuất sắc', text: 'Tốt! Đồ án có tính sáng tạo cao, hoàn thành xuất sắc các tính năng và có giao diện chỉn chu.' },
  { id: 'def-3', label: '⚡ Bổ sung README & Code', text: 'Cần cập nhật thêm file README hướng dẫn cài đặt và sắp xếp lại cấu trúc thư mục mã nguồn.' },
  { id: 'def-4', label: '⚡ Cần tối ưu UI/UX', text: 'Cần cải thiện thêm trải nghiệm người dùng (UI/UX) và kiểm tra lại giao diện trên thiết bị di động.' }
];

export default function VerificationInbox() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PendingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VerificationStatus>('pending');
  const [inspectProject, setInspectProject] = useState<PendingProject | null>(null);

  // Multi-filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState<string>('all');

  // Multi-select & Batch action states
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);

  // Modal State
  const [selectedProject, setSelectedProject] = useState<PendingProject | null>(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);

  // Custom Presets state
  const [customPresets, setCustomPresets] = useState<{ id: string; label: string; text: string }[]>([]);
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetText, setNewPresetText] = useState('');

  // Load Custom Presets from localStorage
  useEffect(() => {
    if (user?.id) {
      const storageKey = `profilehub_teacher_presets_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setCustomPresets(JSON.parse(saved));
        } catch (e) {
          console.error("Lỗi khi đọc preset từ localStorage:", e);
        }
      }
    }
  }, [user]);

  // Save Custom Presets to localStorage
  const saveCustomPresetsToStorage = (newPresets: { id: string; label: string; text: string }[]) => {
    setCustomPresets(newPresets);
    if (user?.id) {
      const storageKey = `profilehub_teacher_presets_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(newPresets));
    }
  };

  const handleAddCustomPreset = () => {
    if (!newPresetText.trim()) return;
    const trimmed = newPresetText.trim();
    const newEntry = {
      id: `custom-${Date.now()}`,
      label: `💬 ${trimmed.length > 20 ? trimmed.substring(0, 20) + '...' : trimmed}`,
      text: trimmed
    };
    const updated = [...customPresets, newEntry];
    saveCustomPresetsToStorage(updated);
    setNewPresetText('');
    setShowAddPreset(false);
  };

  const handleDeleteCustomPreset = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.id !== idToDelete);
    saveCustomPresetsToStorage(updated);
  };

  const fetchPendingProjects = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Lấy danh sách đồ án theo status
      let query = supabase.from('projects').select('*');

      if (activeTab === 'pending') {
        query = query.or('verification_status.eq.pending,verification_status.is.null');
      } else if (activeTab === 'verified') {
        query = query.or('verification_status.eq.verified,is_verified.eq.true');
      } else {
        query = query.eq('verification_status', activeTab);
      }

      const { data: projectData, error: projError } = await query.order('created_at', { ascending: false });

      if (projError) {
        console.error("Lỗi lấy danh sách đồ án:", projError.message);
        setProjects([]);
        setLoading(false);
        return;
      }

      if (projectData && projectData.length > 0) {
        // 2. Lấy danh sách student_id hợp lệ
        const studentIds = Array.from(new Set(projectData.map(p => p.student_id).filter(Boolean)));

        let profileMap = new Map();
        let userMap = new Map();

        if (studentIds.length > 0) {
          const [{ data: profilesData }, { data: usersData }] = await Promise.all([
            supabase.from('student_profiles').select('id, full_name, university, major').in('id', studentIds),
            supabase.from('users').select('id, email, full_name').in('id', studentIds)
          ]);

          if (profilesData) profileMap = new Map(profilesData.map(p => [p.id, p]));
          if (usersData) userMap = new Map(usersData.map(u => [u.id, u]));
        }

        const formattedProjects: PendingProject[] = projectData.map(proj => {
          const profile = profileMap.get(proj.student_id);
          const userData = userMap.get(proj.student_id);
          return {
            ...proj,
            student: {
              full_name: profile?.full_name || userData?.full_name || userData?.email?.split('@')[0] || 'Sinh viên',
              email: userData?.email || '',
              university: profile?.university || 'Đại học Bách Khoa',
              major: profile?.major || 'Công nghệ thông tin',
            }
          };
        });

        // 3. Lọc nghiêm ngặt chỉ hiển thị đồ án được phân công đích danh cho giảng viên hiện tại
        const teacherEmail = user?.email?.toLowerCase().trim() || '';
        const teacherName = (user?.user_metadata?.full_name || user?.user_metadata?.name || '').toLowerCase().trim();
        const teacherUsername = teacherEmail ? teacherEmail.split('@')[0] : '';
        const teacherId = user?.id || '';

        const assignedProjects = formattedProjects.filter(proj => {
          if (proj.verified_by && (proj.verified_by === teacherId || proj.verified_by === user?.email)) {
            return true;
          }

          const projInst = (proj.instructor || '').toLowerCase().trim();
          if (!projInst) return false;

          const matchEmail = teacherEmail !== '' && projInst.includes(teacherEmail);
          const matchUsername = teacherUsername !== '' && projInst.includes(teacherUsername);
          const matchName = teacherName !== '' && projInst.includes(teacherName);

          return matchEmail || matchUsername || matchName;
        });

        setProjects(assignedProjects);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Uncaught error in fetchPendingProjects:", err);
      setProjects([]);
    } finally {
      setLoading(false);
      setSelectedProjectIds([]);
    }
  }, [activeTab, user]);

  useEffect(() => {
    fetchPendingProjects();
  }, [fetchPendingProjects]);

  // Derived unique project types for filter dropdown
  const projectTypesList = useMemo(() => {
    const types = new Set<string>();
    projects.forEach(p => {
      if (p.project_type) types.add(p.project_type);
    });
    return Array.from(types);
  }, [projects]);

  // Filtered projects list based on search and project_type
  const filteredProjects = useMemo(() => {
    return projects.filter(proj => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q ||
        (proj.title || '').toLowerCase().includes(q) ||
        (proj.description || '').toLowerCase().includes(q) ||
        (proj.student?.full_name || '').toLowerCase().includes(q) ||
        (proj.student?.email || '').toLowerCase().includes(q) ||
        (proj.tags || []).some(t => t.toLowerCase().includes(q));

      const matchType = selectedProjectType === 'all' || proj.project_type === selectedProjectType;

      return matchSearch && matchType;
    });
  }, [projects, searchQuery, selectedProjectType]);

  // Checkbox handling
  const isAllSelected = useMemo(() => {
    if (filteredProjects.length === 0) return false;
    return filteredProjects.every(p => selectedProjectIds.includes(p.id));
  }, [filteredProjects, selectedProjectIds]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(filteredProjects.map(p => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedProjectIds.includes(id)) {
      setSelectedProjectIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedProjectIds(prev => [...prev, id]);
    }
  };

  // Batch Approval / Rejection (1-click direct action)
  const handleBatchDecision = async (newStatus: 'verified' | 'rejected') => {
    if (selectedProjectIds.length === 0 || !user) return;

    const confirmMsg = newStatus === 'verified'
      ? `Xác nhận DUYỆT NHANH ${selectedProjectIds.length} đồ án đã chọn?\nHệ thống sẽ gán nhãn Verified Badge 🛡️ và nhận xét mặc định.`
      : `Xác nhận TỪ CHỐI ${selectedProjectIds.length} đồ án đã chọn?\nHệ thống sẽ chuyển trạng thái sang Cần chỉnh sửa.`;

    if (!window.confirm(confirmMsg)) return;

    setIsBatchSubmitting(true);
    const now = new Date().toISOString();

    const targets = projects.filter(p => selectedProjectIds.includes(p.id));

    try {
      const updates = targets.map(proj => {
        const verCode = (proj as any).verification_code || generateVerificationCode();
        const verHash = (proj as any).verification_hash || generateVerificationHash(proj.id, proj.student_id, user.id, now);

        const payload: any = {
          verification_status: newStatus,
          is_verified: newStatus === 'verified',
          verified_by: user.id,
          teacher_feedback: newStatus === 'verified'
            ? (proj.teacher_feedback || "Đã xác thực đồ án bởi Giảng viên")
            : (proj.teacher_feedback || "Cần bổ sung và chỉnh sửa thêm nội dung đồ án"),
          score: proj.score || (newStatus === 'verified' ? "Đạt" : "Chưa đạt"),
          verified_at: now
        };

        if (newStatus === 'verified') {
          payload.verification_code = verCode;
          payload.verification_hash = verHash;
        }

        return supabase
          .from('projects')
          .update(payload)
          .eq('id', proj.id);
      });

      await Promise.all(updates);
      setSelectedProjectIds([]);
      await fetchPendingProjects();
    } catch (err: any) {
      alert("Lỗi khi xử lý hàng loạt: " + err.message);
    } finally {
      setIsBatchSubmitting(false);
    }
  };

  const handleOpenReview = (proj: PendingProject) => {
    setSelectedProject(proj);
    setFeedback(proj.teacher_feedback || '');
    setScore(proj.score || '');
  };

  const handleApplyPreset = (presetText: string) => {
    if (!feedback) {
      setFeedback(presetText);
    } else {
      setFeedback(prev => `${prev}\n${presetText}`);
    }
  };

  const handleVerifyDecision = async (newStatus: 'verified' | 'rejected') => {
    if (!selectedProject || !user) return;
    setSubmitting(true);

    const now = new Date().toISOString();
    const verCode = (selectedProject as any).verification_code || generateVerificationCode();
    const verHash = (selectedProject as any).verification_hash || generateVerificationHash(selectedProject.id, selectedProject.student_id, user.id, now);

    const payload: any = {
      verification_status: newStatus,
      is_verified: newStatus === 'verified',
      verified_by: user.id,
      teacher_feedback: feedback,
      score: score || selectedProject.score,
      verified_at: now
    };

    if (newStatus === 'verified') {
      payload.verification_code = verCode;
      payload.verification_hash = verHash;
    }

    const { error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', selectedProject.id);

    if (error) {
      alert("Lỗi khi cập nhật trạng thái: " + error.message);
    } else {
      setSelectedProject(null);
      fetchPendingProjects();
    }
    setSubmitting(false);
  };

  return (
    <div style={{ padding: '0', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <header className="responsive-header" style={{ height: '70px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Portal Giảng Viên</span>
          <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
          <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>Verification Inbox</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#10b981', backgroundColor: '#ecfdf5', padding: '4px 12px', borderRadius: '12px' }}>
            🛡️ Giảng viên
          </span>
          <span style={{ fontSize: '13px', color: '#475569' }}>{user?.email}</span>
        </div>
      </header>

      {/* Nội dung Inbox */}
      <div className="responsive-container" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#10b981', letterSpacing: '1px', marginBottom: '5px' }}>ACADEMIC CREDENTIAL VERIFICATION</div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '26px', color: '#0f172a' }}>Hộp Thư Phê Duyệt Đồ Án</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Đánh giá, nhận xét và cấp nhãn Verified Badge 🛡️ cho các đồ án của sinh viên.</p>
          </div>
        </div>

        {/* Banner Bảo mật Định danh Giảng viên */}
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>🛡️</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#047857' }}>Quyền Phê Duyệt Riêng Tư (Strict Ownership Verification)</div>
            <div style={{ fontSize: '12px', color: '#065f46' }}>
              Hộp thư được bảo mật phân quyền strictly cho Giảng viên (<strong>{user?.email}</strong>). Chỉ các đồ án được sinh viên gửi đích danh đến email/tên của bạn mới hiển thị tại đây để duyệt.
            </div>
          </div>
        </div>

        {/* Thanh Tabs Lọc Trạng Thái */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          {[
            { id: 'pending', label: '⏳ Chờ Duyệt (Pending)', color: '#d97706', bg: '#fef3c7' },
            { id: 'verified', label: '✅ Đã Xác Thực (Verified)', color: '#059669', bg: '#ecfdf5' },
            { id: 'rejected', label: '❌ Cần Chỉnh Sửa (Rejected)', color: '#dc2626', bg: '#fef2f2' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as VerificationStatus)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? tab.bg : '#f1f5f9',
                color: activeTab === tab.id ? tab.color : '#64748b',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* THANH BỘ LỌC & TÌM KIẾM ĐA NĂNG */}
        <div className="responsive-filter-bar" style={{ backgroundColor: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Ô Tìm Kiếm */}
          <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px' }}>
            <span style={{ color: '#94a3b8', marginRight: '8px', fontSize: '15px' }}>🔍</span>
            <input
              type="text"
              placeholder="Tìm theo Tên SV, Email, Tên đồ án, Công nghệ/Tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '10px 0', fontSize: '13px', color: '#0f172a' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>✕</button>
            )}
          </div>

          {/* Lọc Theo Loại Đồ Án */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Loại đồ án:</span>
            <select
              value={selectedProjectType}
              onChange={e => setSelectedProjectType(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#0f172a', backgroundColor: 'white', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">Tất cả loại đồ án ({projects.length})</option>
              {projectTypesList.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* BẢNG THAO TÁC HÀNG LOẠT NỔI (FLOATING BATCH ACTION BAR) */}
        {selectedProjectIds.length > 0 && (
          <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '14px 24px', borderRadius: '10px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', backgroundColor: '#3b82f6', padding: '4px 10px', borderRadius: '12px' }}>
                Đã chọn {selectedProjectIds.length} / {filteredProjects.length}
              </span>
              <span className="mobile-hide-subtext" style={{ fontSize: '13px', color: '#cbd5e1' }}>Thực thi tác vụ 1-click cho các đồ án đã chọn:</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleBatchDecision('verified')}
                disabled={isBatchSubmitting}
                style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {isBatchSubmitting ? 'Đang xử lý...' : `⚡ Duyệt Nhanh ${selectedProjectIds.length} Đồ Án`}
              </button>

              <button
                onClick={() => handleBatchDecision('rejected')}
                disabled={isBatchSubmitting}
                style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {isBatchSubmitting ? 'Đang xử lý...' : `❌ Từ Chối ${selectedProjectIds.length} Đồ Án`}
              </button>

              <button
                onClick={() => setSelectedProjectIds([])}
                disabled={isBatchSubmitting}
                style={{ padding: '8px 12px', backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #475569', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Header Thanh Chọn Tất Cả */}
        {!loading && filteredProjects.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Chọn tất cả ({filteredProjects.length})
            </label>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Hiển thị {filteredProjects.length} / {projects.length} đồ án
            </div>
          </div>
        )}

        {/* Danh Sách Đồ Án */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', color: '#64748b' }}>
            Đang tải danh sách đồ án...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#0f172a' }}>Không tìm thấy đồ án phù hợp</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc loại đồ án.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredProjects.map(proj => {
              const isSelected = selectedProjectIds.includes(proj.id);
              return (
                <div
                  key={proj.id}
                  className="responsive-card"
                  style={{
                    backgroundColor: isSelected ? '#f0f9ff' : 'white',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '20px',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease'
                  }}
                >
                  
                  {/* Checkbox chọn đồ án */}
                  <div style={{ paddingTop: '4px' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(proj.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Cột Trái: Thông tin Sinh viên & Đồ án */}
                  <div style={{ flex: 1 }}>
                    
                    {/* Header Sinh viên */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                        {proj.student?.full_name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>{proj.student?.full_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {proj.student?.university} • {proj.student?.major} ({proj.student?.email})
                        </div>
                      </div>
                    </div>

                    {/* Chi tiết Đồ án */}
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e3a8a', lineHeight: '1.4' }}>{proj.title}</h3>
                    <p style={{ fontSize: '13px', color: '#475569', marginBottom: '15px', lineHeight: '1.6' }}>{proj.description}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                      <div><span style={{ color: '#64748b' }}>Loại đồ án:</span> <strong>{proj.project_type || 'Đồ án môn học'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Điểm số:</span> <strong style={{ color: '#d97706' }}>{proj.score || 'Chưa chấm'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Giảng viên hướng dẫn:</span> <strong>{proj.instructor || 'Chưa phân công'}</strong></div>
                    </div>

                    {/* Nhãn Tags */}
                    {proj.tags && proj.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '15px' }}>
                        {proj.tags.map(t => (
                          <span key={t} style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '4px' }}>{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Lời nhận xét cũ (nếu có) */}
                    {proj.teacher_feedback && (
                      <div style={{ fontSize: '12px', color: '#047857', backgroundColor: '#ecfdf5', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
                        💬 <strong>Nhận xét của Giảng viên:</strong> {proj.teacher_feedback}
                      </div>
                    )}
                  </div>

                  {/* Cột Phải: Thao tác Duyệt & Tài liệu */}
                  <div className="responsive-card-actions" style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    
                    {proj.github_url && (
                      <button
                        onClick={() => setInspectProject(proj)}
                        style={{ padding: '9px 10px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        💻 Duyệt GitHub Repo (VS Code)
                      </button>
                    )}

                    {proj.demo_url && (
                      <a
                        href={proj.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: '8px 10px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}
                      >
                        🌐 Live Web Demo ↗
                      </a>
                    )}

                    {proj.figma_url && (
                      <a
                        href={proj.figma_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: '8px 10px', backgroundColor: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}
                      >
                        🎨 Design UI/UX (Figma) ↗
                      </a>
                    )}

                    {proj.doc_url && (
                      <a
                        href={proj.doc_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: '8px 10px', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}
                      >
                        📄 Báo Cáo Spec (Doc) ↗
                      </a>
                    )}

                    <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '6px', paddingTop: '8px' }}>
                      <button
                        onClick={() => handleOpenReview(proj)}
                        style={{ width: '100%', padding: '10px', backgroundColor: activeTab === 'verified' ? '#059669' : '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}
                      >
                        {activeTab === 'verified' ? '✏️ Sửa Đánh Giá' : '🛡️ Chấm Điểm & Phê Duyệt'}
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL ĐÁNH GIÁ & XÁC THỰC CỦA GIẢNG VIÊN */}
      {selectedProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#1e3a8a' }}>🛡️ Đánh Giá & Xác Thực Đồ Án</h2>
              <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{selectedProject.title}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Tác giả: <strong>{selectedProject.student?.full_name}</strong></div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Điểm số chính thức (Score / Grade)</label>
              <input
                type="text"
                placeholder="VD: 9.5 / A+ / Xuất Sắc"
                value={score}
                onChange={e => setScore(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            {/* HÀNG PHÍM TẮT MẪU NHẬN XÉT NHANH (QUICK PRESETS) */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>⚡ Phím tắt nhận xét nhanh:</label>
                <button
                  onClick={() => setShowAddPreset(!showAddPreset)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {showAddPreset ? '✕ Hủy' : '➕ Thêm mẫu riêng'}
                </button>
              </div>

              {/* Form Thêm Mẫu Riêng */}
              {showAddPreset && (
                <div style={{ backgroundColor: '#eff6ff', border: '1px dashed #3b82f6', padding: '10px 12px', borderRadius: '8px', marginBottom: '10px', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Nhập câu nhận xét mẫu của bạn..."
                    value={newPresetText}
                    onChange={e => setNewPresetText(e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                  />
                  <button
                    onClick={handleAddCustomPreset}
                    style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Lưu Mẫu
                  </button>
                </div>
              )}

              {/* Danh sách các Preset Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {/* Mẫu mặc định */}
                {DEFAULT_PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyPreset(p.text)}
                    style={{ padding: '5px 10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '16px', fontSize: '11px', color: '#334155', cursor: 'pointer', transition: 'all 0.15s' }}
                    title={p.text}
                  >
                    {p.label}
                  </button>
                ))}

                {/* Mẫu tùy chỉnh do Giảng viên thêm */}
                {customPresets.map(p => (
                  <span
                    key={p.id}
                    onClick={() => handleApplyPreset(p.text)}
                    style={{ padding: '5px 8px 5px 10px', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '16px', fontSize: '11px', color: '#92400e', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    title={p.text}
                  >
                    <span>{p.label}</span>
                    <button
                      onClick={(e) => handleDeleteCustomPreset(p.id, e)}
                      style={{ background: 'none', border: 'none', color: '#b45309', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', padding: 0 }}
                      title="Xóa mẫu này"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Lời nhận xét / Đánh giá của Giảng viên *</label>
              <textarea
                rows={4}
                placeholder="Nhập nhận xét chi tiết hoặc chọn các phím tắt nhanh ở trên..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button
                onClick={() => setSelectedProject(null)}
                disabled={submitting}
                style={{ padding: '10px 18px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}
              >
                Hủy
              </button>

              <button
                onClick={() => handleVerifyDecision('rejected')}
                disabled={submitting}
                style={{ padding: '10px 18px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ❌ Yêu Cầu Sửa / Từ Chối
              </button>

              <button
                onClick={() => handleVerifyDecision('verified')}
                disabled={submitting}
                style={{ padding: '10px 22px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {submitting ? 'Đang cập nhật...' : '🛡️ Phê Duyệt & Gắn Badge'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL TRÌNH ĐỌC MINH CHỨNG */}
      {viewingFileUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '1000px', height: '90vh', backgroundColor: 'white', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '15px 25px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>Xem tài liệu đồ án</h3>
              <button onClick={() => setViewingFileUrl(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <div style={{ flex: 1, backgroundColor: '#cbd5e1' }}>
              <iframe src={viewingFileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Document Viewer" />
            </div>
          </div>
        </div>
      )}

      {/* VS Code Theme GitHub Inspector Modal */}
      <VSCodeViewerModal
        isOpen={Boolean(inspectProject)}
        onClose={() => setInspectProject(null)}
        fileUrl={inspectProject?.demo_url}
        githubUrl={inspectProject?.github_url}
        fileName={`${inspectProject?.title ? inspectProject.title.toLowerCase().replace(/\s+/g, '-') : 'project'}.html`}
      />

    </div>
  );
}
