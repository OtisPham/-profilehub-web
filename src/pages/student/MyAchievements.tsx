import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';

// Khai báo kiểu dữ liệu map với bảng database vừa tạo
interface Achievement {
  id: string;
  title: string;
  category: string;
  level: string;
  date_awarded: string;
  description: string;
  is_featured: boolean;
  verified: boolean;
  image_url: string;
}

export default function MyAchievements() {
  const { user } = useAuth();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [featured, setFeatured] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State tính toán thống kê động
  const [stats, setStats] = useState({
    total: 0,
    academic: 0,
    hackathon: 0,
    extracurricular: 0
  });

  // Hàm Query gọi dữ liệu động từ Supabase
  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    
    // Gọi bảng achievements lọc theo user đang đăng nhập
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAchievements(data);
      
      // Tìm giải thưởng nổi bật (nếu có)
      const featuredItem = data.find(item => item.is_featured);
      setFeatured(featuredItem || null);

      // Tính toán các con số thống kê tự động dựa trên dữ liệu thật
      setStats({
        total: data.length,
        academic: data.filter(i => i.category === 'Học thuật & NCKH').length,
        hackathon: data.filter(i => i.category === 'Cuộc thi & Hackathon').length,
        extracurricular: data.filter(i => i.category === 'Hoạt động ngoại khóa').length
      });
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await fetchAchievements();
      }
    };
    loadData();
  }, [user, fetchAchievements]);

  return (
    <div style={{ padding: '0', width: '100%', boxSizing: 'border-box' }}>
        
        {/* HEADER */}
        <header style={{ height: '70px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            <span>Portal</span> <span style={{ margin: '0 8px' }}>/</span> <span style={{ color: '#0f172a', fontWeight: '500' }}>Student Portfolio</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontWeight: '500' }}>{user?.email}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          {/* TITLE & BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#3b82f6', letterSpacing: '1px', marginBottom: '5px' }}>ACADEMIC DOSSIER / HONORS & RECOGNITION</div>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#0f172a' }}>Awards & Achievements</h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Ghi nhận và tôn vinh những dấu ấn học thuật, giải thưởng nghiên cứu và thành tựu xuất sắc.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ padding: '10px 15px', backgroundColor: 'white', color: '#1e3a8a', border: '1px solid #1e3a8a', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                📄 Xuất bảng thành tích (PDF)
              </button>
              <button style={{ padding: '10px 15px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                + Thêm Thành tích
              </button>
            </div>
          </div>

          {/* DYNAMIC STATS CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '10px' }}>TỔNG SỐ GIẢI THƯỞNG</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '5px' }}>{stats.total < 10 && stats.total > 0 ? `0${stats.total}` : stats.total} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>giải</span></div>
              <div style={{ fontSize: '11px', color: '#10b981' }}>✓ Cập nhật mới nhất hôm nay</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '10px' }}>HỌC THUẬT & NCKH</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '5px' }}>{stats.academic < 10 && stats.academic > 0 ? `0${stats.academic}` : stats.academic} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>giải</span></div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '10px' }}>CUỘC THI / HACKATHON</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '5px' }}>{stats.hackathon < 10 && stats.hackathon > 0 ? `0${stats.hackathon}` : stats.hackathon} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>giải</span></div>
            </div>
            <div style={{ backgroundColor: '#fffbeb', padding: '20px', borderRadius: '12px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '600', marginBottom: '10px' }}>ĐÃ XÁC THỰC BỞI TRƯỜNG</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#b45309' }}>0 <span style={{ fontSize: '14px', color: '#d97706', fontWeight: 'normal' }}>/ {stats.total} giải</span></div>
            </div>
          </div>

          {/* DYNAMIC FEATURED ACHIEVEMENT */}
          {featured && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '30px', display: 'flex', gap: '30px', marginBottom: '30px', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ flex: 1 }}>
                <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>⭐ Thành tích nổi bật nhất (Top Award)</span>
                <h2 style={{ fontSize: '26px', color: '#1e3a8a', margin: '15px 0' }}>{featured.title}</h2>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
                  Đơn vị trao giải: <strong>Đại học Quốc gia HCM</strong> • Cấp độ: <strong>{featured.level}</strong>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>{featured.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button style={{ padding: '10px 20px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>👁️ Xem chứng chỉ số</button>
                  <button style={{ padding: '10px 20px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🔗 Đã thêm vào CV ✓</button>
                </div>
              </div>
              
              {/* Giả lập khung ảnh chứng chỉ */}
              <div style={{ width: '350px', height: '220px', backgroundColor: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage: `url(${featured.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {!featured.image_url && <span style={{ color: '#94a3b8' }}>[Hình ảnh chứng chỉ]</span>}
              </div>
            </div>
          )}

          {/* DYNAMIC LIST */}
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Danh sách giải thưởng ({stats.total})</h3>
          
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : achievements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <p style={{ color: '#64748b' }}>Bạn chưa có thành tích nào. Hãy thêm thành tích mới để làm nổi bật hồ sơ!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {achievements.filter(a => !a.is_featured).map((item) => (
                <div key={item.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <span style={{ fontSize: '11px', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>{item.category}</span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>{item.date_awarded}</span>
                  </div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a', lineHeight: '1.4' }}>{item.title}</h4>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>Cấp độ: <strong>{item.level}</strong></div>
                  
                  {item.verified && (
                    <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
                      <span>✓ Đã xác thực bởi nhà trường</span>
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                    <button style={{ flex: 1, padding: '8px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Chỉnh sửa</button>
                    <button style={{ flex: 1, padding: '8px', backgroundColor: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Xem chi tiết</button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
    </div>
  );
}