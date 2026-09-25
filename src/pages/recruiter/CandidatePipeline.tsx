import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import RecruiterFeedbackModal from '../../components/recruiter/RecruiterFeedbackModal';
import { getSharedPipeline, saveSharedPipeline } from '../../utils/pipelineSync';
import { User, Edit3, MessageSquarePlus, Calendar, Clock, Video, MapPin, Trash2 } from 'lucide-react';
import type { PipelineStage, CandidatePipelineItem } from '../../types/database';

const STAGES: { id: PipelineStage; label: string; color: string; bg: string }[] = [
  { id: 'discovered', label: 'Ứng viên mới', color: '#64748b', bg: '#f1f5f9' },
  { id: 'shortlisted', label: 'Đã chọn (Shortlist)', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'contacted', label: 'Đã liên hệ', color: '#eab308', bg: '#fefce8' },
  { id: 'interview', label: 'Phỏng vấn', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'hired', label: 'Tuyển dụng', color: '#10b981', bg: '#ecfdf5' },
];

export default function CandidatePipeline() {
  const { user } = useAuth();
  const [pipeline, setPipeline] = useState<CandidatePipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal note & feedback
  const [editingItem, setEditingItem] = useState<CandidatePipelineItem | null>(null);
  const [noteText, setNoteText] = useState('');
  const [feedbackCandidate, setFeedbackCandidate] = useState<{ id: string; full_name?: string; major?: string } | null>(null);

  // Modal Interview Schedule
  const [scheduleItem, setScheduleItem] = useState<CandidatePipelineItem | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleMeetingLink, setScheduleMeetingLink] = useState('');
  const [scheduleLocation, setScheduleLocation] = useState('Online (Google Meet)');

  useEffect(() => {
    const fetchPipeline = async () => {
      setLoading(true);
      try {
        const shared = getSharedPipeline(user?.id);
        if (shared && shared.length > 0) {
          setPipeline(shared);
        } else {
          const { data: dbItems } = await supabase
            .from('recruiter_pipeline')
            .select('*, student:student_profiles(*)');

          if (dbItems && dbItems.length > 0) {
            setPipeline(dbItems);
            saveSharedPipeline(dbItems, user?.id);
          } else {
            setPipeline([]);
          }
        }
      } catch (err) {
        console.error("Pipeline fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPipeline();

    const handleSync = () => {
      const shared = getSharedPipeline(user?.id);
      setPipeline(shared);
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [user]);

  const savePipelineToStorage = (updated: CandidatePipelineItem[]) => {
    setPipeline(updated);
    saveSharedPipeline(updated, user?.id);
  };

  const calculateMatchScore = (skills: string[] = []) => {
    const coreSkills = ['React', 'ReactJS', 'Node.js', 'TypeScript', 'SQL', 'Figma', 'Python', 'Git'];
    const matched = skills.filter(s => coreSkills.some(cs => s.toLowerCase().includes(cs.toLowerCase())));
    return Math.min(70 + matched.length * 8, 98);
  };

  const handleMoveStage = (itemId: string, newStage: PipelineStage) => {
    const itemToUpdate = pipeline.find(p => p.id === itemId);
    const updated = pipeline.map(item => item.id === itemId ? { ...item, stage: newStage, updated_at: new Date().toISOString() } : item);
    savePipelineToStorage(updated);

    // Auto open Interview Schedule Modal when moving to 'interview'
    if (newStage === 'interview' && itemToUpdate) {
      handleOpenScheduleModal(itemToUpdate);
    }
  };

  const handleOpenNoteModal = (item: CandidatePipelineItem) => {
    setEditingItem(item);
    setNoteText(item.private_notes || '');
  };

  const handleSaveNote = () => {
    if (!editingItem) return;
    const updated = pipeline.map(item => item.id === editingItem.id ? { ...item, private_notes: noteText } : item);
    savePipelineToStorage(updated);
    setEditingItem(null);
  };

  const handleOpenScheduleModal = (item: CandidatePipelineItem) => {
    setScheduleItem(item);
    setScheduleDate(item.interview_date || '2026-09-26');
    setScheduleTime(item.interview_time || '10:00 AM');
    setScheduleMeetingLink(item.meeting_link || 'https://meet.google.com/abc-defg-hij');
    setScheduleLocation(item.interview_location || 'Online (Google Meet)');
  };

  const handleSaveSchedule = () => {
    if (!scheduleItem) return;
    const updated = pipeline.map(item =>
      item.id === scheduleItem.id
        ? {
            ...item,
            interview_date: scheduleDate,
            interview_time: scheduleTime,
            meeting_link: scheduleMeetingLink,
            interview_location: scheduleLocation,
            interview_status: 'pending_student' as const,
            stage: 'interview' as PipelineStage,
            updated_at: new Date().toISOString()
          }
        : item
    );
    savePipelineToStorage(updated);
    setScheduleItem(null);
  };

  const handleDeleteSchedule = (itemId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy / xóa lịch phỏng vấn của ứng viên này không?')) {
      const updated = pipeline.map(item =>
        item.id === itemId
          ? {
              ...item,
              interview_date: undefined,
              interview_time: undefined,
              meeting_link: undefined,
              interview_location: undefined,
              interview_status: undefined
            }
          : item
      );
      savePipelineToStorage(updated);
      if (scheduleItem?.id === itemId) {
        setScheduleItem(null);
      }
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>✅ SV Đã Xác Nhận</span>;
      case 'pending_student':
        return <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '10px', border: '1px solid #fde68a' }}>⏳ Chờ SV Xác Nhận</span>;
      case 'completed':
        return <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '10px' }}>🏁 Phỏng Vấn Xong</span>;
      default:
        return <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: '10px' }}>📅 Đã Hẹn Lịch</span>;
    }
  };

  return (
    <div style={{ padding: '30px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '25px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
            📊 Pipeline Quản Lý Ứng Viên & Lịch Phỏng Vấn (2 Chiều)
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            Mời phỏng vấn, theo dõi trạng thái xác nhận từ sinh viên realtime và gửi đánh giá năng lực.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Đang tải pipeline...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(240px, 1fr))', gap: '16px', alignItems: 'start' }}>
            {STAGES.map(stage => {
              const items = pipeline.filter(p => p.stage === stage.id);
              return (
                <div key={stage.id} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {/* Column Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: `2px solid ${stage.color}` }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>{stage.label}</span>
                    <span style={{ backgroundColor: stage.bg, color: stage.color, fontSize: '12px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>
                      {items.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {items.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px 10px', color: '#94a3b8', fontSize: '12px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                        Chưa có ứng viên
                      </div>
                    ) : (
                      items.map(item => (
                        <div key={item.id} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                              <User size={18} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {item.student?.full_name || 'Ứng viên'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{item.student?.major || 'Sinh viên'}</div>
                              <div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 'bold', backgroundColor: '#f5f3ff', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                                ✨ AI Match Score: {calculateMatchScore(item.student?.skills)}%
                              </div>
                            </div>
                          </div>

                          {item.student?.skills && item.student.skills.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                              {item.student.skills.slice(0, 3).map((sk: string, idx: number) => (
                                <span key={idx} style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                                  {sk}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Interview Schedule Box if present */}
                          {(item.stage === 'interview' || item.interview_date) && (
                            <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '6px', padding: '8px 10px', marginBottom: '10px' }}>
                              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Calendar size={12} /> Lịch Phỏng Vấn:
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {getStatusBadge(item.interview_status)}
                                  {item.interview_date && (
                                    <button
                                      onClick={() => handleDeleteSchedule(item.id)}
                                      title="Hủy / Xóa lịch phỏng vấn"
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              {item.interview_date ? (
                                <>
                                  <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} color="#6d28d9" /> {item.interview_date} lúc {item.interview_time || '10:00 AM'}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={11} /> {item.interview_location || 'Online'}
                                  </div>
                                  {item.meeting_link && (
                                    <a
                                      href={item.meeting_link}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px', color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}
                                    >
                                      <Video size={12} /> Vào cuộc họp (Meet)
                                    </a>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={() => handleOpenScheduleModal(item)}
                                  style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '4px' }}
                                >
                                  + Hẹn Lịch Phỏng Vấn
                                </button>
                              )}
                            </div>
                          )}

                          {/* Private note preview */}
                          {item.private_notes && (
                            <div style={{ fontSize: '11px', backgroundColor: '#fffbeb', color: '#b45309', padding: '6px 8px', borderRadius: '4px', marginBottom: '10px', fontStyle: 'italic', borderLeft: '3px solid #f59e0b' }}>
                              📝 {item.private_notes}
                            </div>
                          )}

                          {/* Actions */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', gap: '6px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleOpenNoteModal(item)}
                                style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: 0 }}
                              >
                                <Edit3 size={12} /> Ghi chú
                              </button>

                              <button
                                onClick={() => handleOpenScheduleModal(item)}
                                style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: 0, fontWeight: '500' }}
                              >
                                <Calendar size={12} /> Hẹn lịch
                              </button>

                              <button
                                onClick={() => setFeedbackCandidate({ id: item.student_id, full_name: item.student?.full_name, major: item.student?.major })}
                                style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: 0, fontWeight: 'bold' }}
                              >
                                <MessageSquarePlus size={12} /> Feedback
                              </button>
                            </div>

                            <select
                              value={item.stage}
                              onChange={e => handleMoveStage(item.id, e.target.value as PipelineStage)}
                              style={{ fontSize: '11px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                            >
                              {STAGES.map(s => (
                                <option key={s.id} value={s.id}>➡️ {s.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Recruiter Feedback Loop */}
        {feedbackCandidate && (
          <RecruiterFeedbackModal
            isOpen={!!feedbackCandidate}
            onClose={() => setFeedbackCandidate(null)}
            candidate={feedbackCandidate}
          />
        )}

        {/* Modal Đặt/Chỉnh Sửa Lịch Phỏng Vấn */}
        {scheduleItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📅 Mời Phỏng Vấn: {scheduleItem.student?.full_name}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                Gửi lời mời phỏng vấn đến sinh viên. Sinh viên sẽ nhận được thông báo để xác nhận tham gia.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    📅 Ngày Phỏng Vấn
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    ⏰ Giờ Phỏng Vấn
                  </label>
                  <input
                    type="text"
                    value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                    placeholder="VD: 10:00 AM hoặc 14:30"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    📍 Hình thức / Địa điểm
                  </label>
                  <input
                    type="text"
                    value={scheduleLocation}
                    onChange={e => setScheduleLocation(e.target.value)}
                    placeholder="VD: Online (Google Meet) hoặc Văn phòng Tầng 5"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    🔗 Link cuộc họp Trực tuyến (Meet / Zoom)
                  </label>
                  <input
                    type="url"
                    value={scheduleMeetingLink}
                    onChange={e => setScheduleMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/xxx-yyy-zzz"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                {scheduleItem.interview_date ? (
                  <button
                    onClick={() => handleDeleteSchedule(scheduleItem.id)}
                    style={{ padding: '8px 14px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={14} /> Xóa / Hủy Lịch
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setScheduleItem(null)}
                    style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveSchedule}
                    style={{ padding: '8px 16px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🚀 Gửi Lời Mời Phỏng Vấn
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Chỉnh sửa Ghi chú Nội bộ */}
        {editingItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '18px' }}>
                📝 Ghi Chú Đánh Giá Nội Bộ: {editingItem.student?.full_name}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                Ghi chú này là bảo mật và chỉ tài khoản Nhà tuyển dụng của bạn nhìn thấy.
              </p>
              <textarea
                rows={5}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Nhập nhận xét về portfolio, thái độ, mức lương kỳ vọng hoặc kết quả phỏng vấn..."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={() => setEditingItem(null)}
                  style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveNote}
                  style={{ padding: '8px 16px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Lưu ghi chú
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
