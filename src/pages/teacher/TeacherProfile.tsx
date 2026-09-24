import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import { UserCheck, Building, BookOpen, GraduationCap, Mail, Save, CheckCircle2 } from 'lucide-react';

export default function TeacherProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [academicTitle, setAcademicTitle] = useState('Thạc sĩ (ThS.)');
  const [university, setUniversity] = useState('Đại Học Bách Khoa TP.HCM');
  const [department, setDepartment] = useState('Khoa Khoa Học & Kỹ Thuật Máy Tính');
  const [subjects, setSubjects] = useState('Lập trình Web, Cấu trúc Dữ liệu & Giải thuật, Đồ án Chuyên ngành');
  const [phone, setPhone] = useState('0908 123 456');
  const [bio, setBio] = useState('Giảng viên hướng dẫn chuyên ngành Công nghệ thông tin, nghiên cứu hệ thống phân tán và phát triển web hiện đại.');

  useEffect(() => {
    const loadTeacherProfile = async () => {
      if (!user) return;
      try {
        const { data } = await supabase.from('teacher_profiles').select('*').eq('id', user.id).single();
        if (data) {
          setFullName(data.full_name || '');
          setAcademicTitle(data.academic_title || 'Thạc sĩ (ThS.)');
          setUniversity(data.university || 'Đại Học Bách Khoa TP.HCM');
          setDepartment(data.department || 'Khoa Khoa Học & Kỹ Thuật Máy Tính');
          setSubjects(data.subjects || 'Lập trình Web, Cấu trúc Dữ liệu & Giải thuật');
          setPhone(data.phone || '0908 123 456');
          setBio(data.bio || '');
        } else {
          // Local storage fallback
          const localData = localStorage.getItem(`teacher_profile_${user.id}`);
          if (localData) {
            const parsed = JSON.parse(localData);
            setFullName(parsed.fullName || '');
            setAcademicTitle(parsed.academicTitle || 'Thạc sĩ (ThS.)');
            setUniversity(parsed.university || 'Đại Học Bách Khoa TP.HCM');
            setDepartment(parsed.department || 'Khoa Khoa Học & Kỹ Thuật Máy Tính');
            setSubjects(parsed.subjects || '');
            setPhone(parsed.phone || '');
            setBio(parsed.bio || '');
          } else {
            setFullName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Giảng viên');
          }
        }
      } catch (err) {
        console.warn("Load teacher profile fallback:", err);
      }
    };

    loadTeacherProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    const payload = {
      id: user?.id,
      full_name: fullName,
      academic_title: academicTitle,
      university,
      department,
      subjects,
      phone,
      bio,
      updated_at: new Date().toISOString()
    };

    // Fallback save to localStorage
    localStorage.setItem(`teacher_profile_${user?.id || 'default'}`, JSON.stringify({
      fullName, academicTitle, university, department, subjects, phone, bio
    }));

    try {
      if (user?.id) {
        await supabase.from('teacher_profiles').upsert([payload]);
      }
    } catch (err) {
      console.warn("DB Upsert error fallback to local:", err);
    }

    setLoading(false);
    setSuccessMsg('Đã lưu thông tin hồ sơ Giảng viên thành công!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Banner */}
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#059669', letterSpacing: '1px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GraduationCap size={16} /> TEACHER PROFILE MANAGEMENT
          </div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', color: '#0f172a' }}>
            Cập Nhật Thông Tin Giảng Viên
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Quản lý tên môn học phụ trách, trường đào tạo và bộ môn để sinh viên gửi yêu cầu duyệt đồ án chính xác.
          </p>
        </div>

        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669', backgroundColor: '#ecfdf5', padding: '6px 14px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
          👨‍🏫 Portal Giảng Viên
        </span>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 'bold' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Profile Form Card */}
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        
        {/* Section 1: Thông tin cá nhân & Học hàm */}
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#047857', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          <UserCheck size={18} /> 1. Thông Tin Định Danh & Học Vị
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Họ và tên Giảng viên *</label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn A"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Học hàm / Học vị</label>
            <select
              value={academicTitle}
              onChange={e => setAcademicTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: 'white' }}
            >
              <option>Thạc sĩ (ThS.)</option>
              <option>Tiến sĩ (TS.)</option>
              <option>Phó Giáo sĩ - Tiến sĩ (PGS.TS.)</option>
              <option>Giáo sư - Tiến sĩ (GS.TS.)</option>
              <option>Giảng viên Chính</option>
            </select>
          </div>
        </div>

        {/* Section 2: Trường đào tạo & Bộ môn */}
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#047857', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginTop: '10px' }}>
          <Building size={18} /> 2. Trường Đại Học & Bộ Môn Giảng Dạy
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Trường Đại học / Viện Đào tạo *</label>
            <input
              type="text"
              required
              placeholder="VD: ĐH Bách Khoa TP.HCM"
              value={university}
              onChange={e => setUniversity(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Khoa / Bộ môn *</label>
            <input
              type="text"
              required
              placeholder="VD: Khoa Khoa học & Kỹ thuật Máy tính"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Section 3: Môn học phụ trách */}
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#047857', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginTop: '10px' }}>
          <BookOpen size={18} /> 3. Danh Sách Môn Học Phụ Trách & Hướng Dẫn
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Tên các môn học (Cách nhau bởi dấu phẩy) *</label>
          <input
            type="text"
            required
            placeholder="VD: Lập trình Web, Cấu trúc Dữ liệu & Giải thuật, Đồ án Chuyên ngành, Khóa luận Tốt nghiệp"
            value={subjects}
            onChange={e => setSubjects(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
          />
          <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
            💡 Môn học này sẽ được sinh viên đối chiếu khi chọn Giảng viên hướng dẫn để gửi yêu cầu phê duyệt đồ án.
          </span>
        </div>

        {/* Section 4: Liên hệ & Hướng nghiên cứu */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Email làm việc (Hệ thống)</label>
            <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} /> {user?.email}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Số điện thoại liên hệ</label>
            <input
              type="text"
              placeholder="VD: 0908 123 456"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Giới thiệu bản thân & Hướng nghiên cứu</label>
          <textarea
            rows={3}
            placeholder="Nhập mô tả về kinh nghiệm giảng dạy, định hướng hướng dẫn đồ án cho sinh viên..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu Thông Tin Hồ Sơ'}
          </button>
        </div>

      </form>
    </div>
  );
}
