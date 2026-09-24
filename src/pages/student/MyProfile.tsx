import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. THÊM IMPORT NÀY
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';

// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU
interface CardProps {
  title: string | React.ReactNode;
  actionText?: string;
  children: React.ReactNode;
}

interface StudentProfile {
  id?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  major?: string;
  university?: string;
  gpa?: string;
  skills?: string[];
  updated_at?: string;
}

// 2. COMPONENT CARD TÁCH RỜI
const Card = ({ title, actionText, children }: CardProps) => (
  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {title}
      </h3>
      {actionText && <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>✎ {actionText}</button>}
    </div>
    {children}
  </div>
);

// 3. COMPONENT CHÍNH
export default function MyProfile() {
  const { user } = useAuth();
  const navigate = useNavigate(); // 2. KHỞI TẠO CÔNG CỤ CHUYỂN TRANG
  
  // Trạng thái điều khiển chế độ Xem/Sửa
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Dữ liệu dùng để HIỂN THỊ trên Dashboard
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Dữ liệu dùng để NHẬP trong Form
  const [formData, setFormData] = useState({
    full_name: '', major: '', university: 'Trường Đại học Bách Khoa', gpa: '', bio: '', skills: ''
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('student_profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
      // Đổ dữ liệu vào Form
      setFormData({
        full_name: data.full_name || '',
        major: data.major || '',
        university: data.university || 'Trường Đại học Bách Khoa',
        gpa: data.gpa || '',
        bio: data.bio || '',
        skills: data.skills ? data.skills.join(', ') : ''
      });
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  // Xử lý khi bấm nút "Lưu hồ sơ" ở Form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== '');
    const updates = {
      id: user?.id,
      full_name: formData.full_name,
      major: formData.major,
      university: formData.university,
      gpa: formData.gpa,
      bio: formData.bio,
      skills: skillsArray,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('student_profiles').upsert(updates);

    if (error) {
      setMessage({ type: 'error', text: 'Lỗi: ' + error.message });
    } else {
      await fetchProfile(); // Cập nhật lại dữ liệu mới nhất
      setIsEditing(false);  // Quay về màn hình Dashboard sau khi lưu thành công
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: '0', width: '100%', boxSizing: 'border-box' }}>
      <header style={{ height: '70px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', color: '#64748b' }}><span>Portal</span> <span style={{ margin: '0 8px' }}>/</span> <span style={{ color: '#0f172a', fontWeight: '500' }}>Student Portfolio</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '500' }}>{user?.email}</div>
        </header>

        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>⚙ CHẾ ĐỘ HIỂN THỊ:</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', backgroundColor: !isEditing ? '#1e3a8a' : 'transparent', color: !isEditing ? 'white' : '#64748b', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: !isEditing ? '600' : '500', cursor: 'pointer' }}>🪪 Hồ sơ tổng quan</button>
              <button onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', backgroundColor: isEditing ? '#1e3a8a' : 'transparent', color: isEditing ? 'white' : '#64748b', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: isEditing ? '600' : '500', cursor: 'pointer' }}>✎ Chỉnh sửa (Edit Form)</button>
              <button style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#64748b', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>👁️ Xem trước Tuyển dụng</button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '900px' }}>
              <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>Cập nhật Hồ sơ</h2>
              
              {message.text && (
                <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#fee2e2', color: '#991b1b' }}>❌ {message.text}</div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Họ và tên</label><input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Trường học</label><input type="text" value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Chuyên ngành</label><input type="text" value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>GPA</label><input type="text" value={formData.gpa} onChange={e => setFormData({...formData, gpa: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Kỹ năng (Cách nhau bởi dấu phẩy)</label>
                <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Giới thiệu bản thân (Bio)</label>
                <textarea rows={4} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>
                <button type="submit" disabled={saving} style={{ padding: '12px 24px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{saving ? 'Đang lưu...' : 'Lưu hồ sơ'}</button>
              </div>
            </form>
          ) : (
            // ============ CHẾ ĐỘ XEM (DASHBOARD) ============
            <>
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', color: '#94a3b8' }}>
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'Ảnh'}
                  </div>
                  <div>
                    <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {profile?.full_name || 'Hồ sơ chưa cập nhật'} 
                      <span style={{ fontSize: '14px', backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}>✓ Verified</span>
                    </h1>
                    <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#334155', fontWeight: '600' }}>{profile?.major || 'Chưa cập nhật chuyên ngành'}</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>🎯 GPA: {profile?.gpa || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => setIsEditing(true)} style={{ padding: '10px 20px', backgroundColor: 'white', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>✎ Chỉnh sửa hồ sơ</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Card title="👤 About Me (Giới thiệu bản thân)">
                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 15px 0', whiteSpace: 'pre-wrap' }}>
                      {profile?.bio || 'Chưa có thông tin giới thiệu.'}
                    </p>
                  </Card>
                  <Card title="🎓 Education (Học vấn & Điểm quá trình)">
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#0f172a' }}>{profile?.university || 'Chưa cập nhật trường'}</h4>
                    <div style={{ fontSize: '13px', color: '#475569' }}>{profile?.major}</div>
                  </Card>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  
                  {/* 3. ĐÃ BỔ SUNG LẠI NÚT MỞ CV BUILDER TẠI ĐÂY */}
                  <Card title="🔄 Tạo CV & Đồng bộ">
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>Dữ liệu của bạn sẽ được tự động liên kết sang công cụ tạo CV Chuẩn Doanh nghiệp.</p>
                    <button 
                      onClick={() => navigate('/cv-builder')}
                      style={{ width: '100%', padding: '12px', backgroundColor: '#f1f5f9', color: '#1e3a8a', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                      🪄 Mở CV Builder
                    </button>
                  </Card>

                  <Card title="💡 Kỹ năng chuyên môn">
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: '1.8' }}>
                      {profile?.skills && profile.skills.length > 0 ? profile.skills.map((s, i) => <li key={i}>{s}</li>) : <li>Chưa cập nhật kỹ năng</li>}
                    </ul>
                  </Card>
                </div>
              </div>
            </>
          )}

        </div>
    </div>
  );
}