import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import type { SavedCandidate, StudentProfile } from '../../types/database';
import { Folder, Star, Trash2, Scale } from 'lucide-react';

export default function SavedCandidates() {
  const { user } = useAuth();
  const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('Tất cả');
  const [loading, setLoading] = useState(true);

  // Candidate comparison state
  const [compareList, setCompareList] = useState<StudentProfile[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    const fetchSaved = async () => {
      setLoading(true);
      try {
        const localSaved = localStorage.getItem(`saved_candidates_${user?.id || 'default'}`);
        if (localSaved) {
          setSavedCandidates(JSON.parse(localSaved));
        } else {
          setSavedCandidates([]);
        }
      } catch (err) {
        console.error("Fetch saved candidates error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user]);

  const folders = ['Tất cả', ...Array.from(new Set(savedCandidates.map(sc => sc.folder_name)))];

  const filteredCandidates = selectedFolder === 'Tất cả'
    ? savedCandidates
    : savedCandidates.filter(sc => sc.folder_name === selectedFolder);

  const handleDeleteSaved = (id: string) => {
    const updated = savedCandidates.filter(sc => sc.id !== id);
    setSavedCandidates(updated);
    localStorage.setItem(`saved_candidates_${user?.id || 'default'}`, JSON.stringify(updated));
  };

  const toggleCompare = (student: StudentProfile) => {
    if (compareList.some(s => s.id === student.id)) {
      setCompareList(compareList.filter(s => s.id !== student.id));
    } else {
      if (compareList.length >= 3) {
        alert('Chỉ có thể so sánh tối đa 3 ứng viên cùng lúc!');
        return;
      }
      setCompareList([...compareList, student]);
    }
  };

  return (
    <div style={{ padding: '30px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
              ⭐ Danh Sách Ứng Viên Đã Lưu & Thư Mục
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              Phân loại hồ sơ ứng viên theo từng vị trí tuyển dụng và so sánh trực quan năng lực.
            </p>
          </div>

          {compareList.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              style={{ padding: '10px 18px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Scale size={18} /> So sánh ({compareList.length}) Ứng viên
            </button>
          )}
        </div>

        {/* Folders Bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '8px' }}>
          {folders.map((folder, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedFolder(folder)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                backgroundColor: selectedFolder === folder ? '#1e3a8a' : 'white',
                color: selectedFolder === folder ? 'white' : '#475569',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Folder size={14} /> {folder}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Đang tải danh sách đã lưu...</div>
        ) : filteredCandidates.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Star size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
            <h3 style={{ color: '#475569', margin: '0 0 8px 0' }}>Chưa có ứng viên nào trong thư mục này</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Bạn có thể lưu ứng viên từ trang Tìm kiếm Ứng viên (Discover).</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredCandidates.map(sc => {
              const isComparing = compareList.some(s => s.id === sc.student?.id);
              return (
                <div key={sc.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#f5f3ff', color: '#8b5cf6', padding: '4px 10px', borderRadius: '12px' }}>
                        📁 {sc.folder_name}
                      </span>
                      <button
                        onClick={() => handleDeleteSaved(sc.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Xóa khỏi danh sách lưu"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>
                      {sc.student?.full_name}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 12px 0' }}>
                      🎓 {sc.student?.major} • {sc.student?.university}
                    </p>

                    {sc.student?.skills && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {sc.student.skills.map((sk, idx) => (
                          <span key={idx} style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px' }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <button
                      onClick={() => sc.student && toggleCompare(sc.student)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: isComparing ? '1px solid #8b5cf6' : '1px solid #cbd5e1',
                        backgroundColor: isComparing ? '#f5f3ff' : '#f8fafc',
                        color: isComparing ? '#8b5cf6' : '#475569',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {isComparing ? '✓ Đã chọn so sánh' : '+ Chọn so sánh'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal So Sánh Năng Lực Ứng Viên */}
        {showCompareModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale size={24} color="#8b5cf6" /> Bảng So Sánh Năng Lực Ứng Viên
                </h2>
                <button onClick={() => setShowCompareModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareList.length}, 1fr)`, gap: '16px' }}>
                {compareList.map(candidate => (
                  <div key={candidate.id} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 6px 0', color: '#1e3a8a' }}>{candidate.full_name}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0' }}>{candidate.major}</p>

                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ fontSize: '12px', color: '#334155' }}>Trường học:</strong>
                      <div style={{ fontSize: '13px', color: '#0f172a' }}>{candidate.university || 'N/A'}</div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ fontSize: '12px', color: '#334155' }}>Điểm trung bình (GPA):</strong>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#10b981' }}>{candidate.gpa || 'N/A'}</div>
                    </div>

                    <div>
                      <strong style={{ fontSize: '12px', color: '#334155' }}>Kỹ năng sở trường:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {candidate.skills?.map((sk, i) => (
                          <span key={i} style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px' }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
