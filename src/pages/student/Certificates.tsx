import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import CertificateModal  from '../../components/certificates/CertificateModal';
import type { CertificateData } from '../../components/certificates/CertificateModal'
export default function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  
  // States điều khiển Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);

  // State điều khiển Modal Trình đọc PDF/Ảnh
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCertificates(data);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      await fetchCertificates();
    };
    loadData();
  }, [fetchCertificates]);

  const handleAddNew = () => {
    setSelectedCert(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cert: CertificateData) => {
    setSelectedCert(cert);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa chứng chỉ này?");
    if (confirmDelete) {
      await supabase.from('certificates').delete().eq('id', id);
      fetchCertificates(); 
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchCertificates();
  };

  const featuredCert = certificates.find(c => c.is_featured) || certificates[0];
  const listCerts = certificates.filter(c => !c.is_featured || certificates.length <= 1);

  return (
    <div style={{ padding: '0', width: '100%', boxSizing: 'border-box' }}>
        
        {/* HEADER ĐIỀU HƯỚNG TABS */}
        <header style={{ backgroundColor: '#ffffff', padding: '15px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '30px', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginRight: '20px' }}>Portal / Student Portfolio</div>
          <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '15px', marginBottom: '-16px', cursor: 'pointer' }}>Bảng điều khiển & Lưới</span>
          </div>
        </header>

        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#3b82f6', letterSpacing: '1px', marginBottom: '5px', textTransform: 'uppercase' }}>Academic Dossier / Honor & Recognition</div>
              <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#0f172a' }}>Certificates & Achievements</h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#475569', maxWidth: '600px', lineHeight: '1.5' }}>Ghi nhận và tôn vinh những dấu mốc học thuật, giải thưởng nghiên cứu và thành tựu xuất sắc.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleAddNew} style={{ padding: '10px 15px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>+ Thêm chứng chỉ</button>
            </div>
          </div>

          {certificates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <p style={{ color: '#64748b' }}>Bạn chưa có chứng chỉ nào. Hãy ấn nút "Thêm chứng chỉ" phía trên nhé.</p>
            </div>
          ) : (
            <>
              {/* ===================== FEATURED CARD ===================== */}
              {featuredCert && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '30px', display: 'flex', gap: '40px', marginBottom: '30px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>
                      🏆 {featuredCert.rank || 'Nổi bật'}
                    </div>
                    <h2 style={{ fontSize: '24px', color: '#1e3a8a', margin: '0 0 15px 0', lineHeight: '1.4', textTransform: 'uppercase' }}>
                      {featuredCert.title}
                    </h2>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
                      Đơn vị trao giải: <strong>{featuredCert.issuer}</strong>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>{featuredCert.description}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button onClick={() => setViewingFileUrl(featuredCert.image_url || null)} disabled={!featuredCert.image_url} style={{ padding: '10px 20px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: featuredCert.image_url ? 'pointer' : 'not-allowed' }}>🏅 Xem chứng thư</button>
                      <button onClick={() => handleEdit(featuredCert)} style={{ padding: '10px 20px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>✎ Sửa</button>
                      <button onClick={() => handleDelete(featuredCert.id)} style={{ padding: '10px 20px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🗑 Xóa</button>
                    </div>
                  </div>
                  
                  {/* Khu vực Live Preview Tài liệu bên cạnh */}
                  <div 
                    onClick={() => featuredCert.image_url && setViewingFileUrl(featuredCert.image_url)}
                    style={{ 
                      width: '400px', 
                      height: '260px', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '12px', 
                      border: '1px solid #cbd5e1', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden', 
                      cursor: featuredCert.image_url ? 'pointer' : 'default',
                      position: 'relative'
                    }}
                  >
                    {featuredCert.image_url ? (
                      featuredCert.image_url.toLowerCase().includes('.pdf') ? (
                        <iframe 
                          src={`${featuredCert.image_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                          style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} 
                          title="PDF Preview" 
                        />
                      ) : (
                        <img 
                          src={featuredCert.image_url} 
                          alt="Chứng nhận" 
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px', boxSizing: 'border-box' }} 
                        />
                      )
                    ) : (
                      <span style={{ fontSize: '40px' }}>📜</span>
                    )}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}></div>
                  </div>
                </div>
              )}

                {/* LƯỚI DANH SÁCH CÁC CHỨNG CHỈ KHÁC (GRID) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {listCerts.map((item) => (
                  <div key={item.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <span style={{ fontSize: '11px', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{item.category}</span>
                      <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: 'bold' }}>{item.date_awarded}</span>
                    </div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#1e3a8a', lineHeight: '1.4' }}>{item.title}</h4>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', lineHeight: '1.5' }}>{item.issuer}</div>
                    
                    {item.rank && (
                      <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '12px', color: '#334155', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                        <strong>Thành tích:</strong> {item.rank}
                      </div>
                    )}

                    {/* ================= KHU VỰC HIỂN THỊ KỸ NĂNG/MÔ TẢ (MỚI) ================= */}
                    {item.description && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#475569', 
                        marginBottom: '15px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,         // Cắt chữ nếu vượt quá 2 dòng
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.6'
                      }}>
                        <strong style={{ color: '#0f172a' }}>Kỹ năng: </strong>
                        {item.description}
                      </div>
                    )}
                    {/* ======================================================================== */}

                    {/* Khu vực hiển thị tài liệu thu nhỏ trong danh sách */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                      <div style={{ 
                        width: '100%', 
                        height: '140px', 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '8px', 
                        border: '1px solid #cbd5e1', 
                        overflow: 'hidden', 
                        position: 'relative',
                        flexShrink: 0
                      }}>
                        {item.image_url ? (
                          item.image_url.toLowerCase().includes('.pdf') ? (
                            <iframe 
                              src={`${item.image_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                              style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} 
                              title="PDF Preview" 
                            />
                          ) : (
                            <img 
                              src={item.image_url} 
                              alt={item.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          )
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '30px' }}>📜</div>
                        )}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}></div>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                      <button onClick={() => setViewingFileUrl(item.image_url || null)} disabled={!item.image_url} style={{ flex: 1, padding: '8px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: item.image_url ? 'pointer' : 'not-allowed', opacity: item.image_url ? 1 : 0.5 }}>Xem</button>
                      <button onClick={() => handleEdit(item)} style={{ flex: 1, padding: '8px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Sửa</button>
                      <button onClick={() => handleDelete(item.id)} style={{ flex: 1, padding: '8px 12px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

      {/* Modal Thêm / Sửa Chứng chỉ */}
      <CertificateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleModalSuccess} 
        editData={selectedCert} 
      />

      {/* ===================== TRÌNH ĐỌC PDF / ẢNH (VIEWER MODAL) ===================== */}
      {viewingFileUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '1000px', height: '90vh', backgroundColor: 'white', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            
            <div style={{ padding: '15px 25px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Chế độ xem tài liệu</h3>
              <div style={{ display: 'flex', gap: '15px' }}>
                <a href={viewingFileUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#3b82f6', fontSize: '14px', fontWeight: '600' }}>Mở trong tab mới ↗</a>
                <button onClick={() => setViewingFileUrl(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✖</button>
              </div>
            </div>

            <div style={{ flex: 1, width: '100%', backgroundColor: '#e2e8f0' }}>
              <iframe 
                src={viewingFileUrl} 
                style={{ width: '100%', height: '100%', border: 'none' }} 
                title="Trình đọc chứng chỉ"
              />
            </div>
            
          </div>
        </div>
      )}
      {/* ============================================================================== */}

    </div>
  );
}