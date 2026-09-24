import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import AuthLayout from '../../components/layout/AuthLayout';
import { Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '../../types/database';

export default function Register() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }

    // 1. Đăng ký qua Supabase Auth kèm user_metadata (role, full_name)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Chèn record vào bảng public.users
    if (authData.user) {
      await supabase.from('users').upsert({
        id: authData.user.id,
        email,
        full_name: fullName || email.split('@')[0],
        role,
      });

      // Nếu là Sinh viên, tạo luôn bản ghi student_profiles khởi tạo
      if (role === 'student') {
        await supabase.from('student_profiles').upsert({
          id: authData.user.id,
          full_name: fullName || email.split('@')[0],
        });
      }
    }

    navigate('/dashboard');
    setLoading(false);
  };

  const leftContent = (
    <>
      <h1 style={{ fontSize: '42px', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '20px' }}>Join the <span style={{ color: '#10b981' }}>Network.</span></h1>
      <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.6' }}>Tạo tài khoản để bắt đầu xây dựng hồ sơ học thuật, nhận chứng thực từ giảng viên và kết nối với doanh nghiệp.</p>
    </>
  );

  return (
    <AuthLayout leftContent={leftContent}>
      <div style={{ marginBottom: '25px' }}>
        <h5 style={{ margin: 0, color: '#1e3a8a', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>NEW ACCOUNT REGISTRATION</h5>
        <h2 style={{ margin: '10px 0', fontSize: '28px', color: '#0f172a' }}>Tạo Tài Khoản Mới</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Chọn vai trò phù hợp của bạn trong hệ thống PROFILEHUB.</p>
      </div>

      <form onSubmit={handleRegister}>
        {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 15px 0', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</p>}

        {/* Chọn Vai trò (Role Selector) */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Bạn là ai trong hệ thống?</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { id: 'student', label: '👨‍🎓 Sinh viên' },
              { id: 'teacher', label: '👨‍🏫 Giảng viên' },
              { id: 'recruiter', label: '🏢 Tuyển dụng' }
            ].map(item => (
              <button
                type="button"
                key={item.id}
                onClick={() => setRole(item.id as UserRole)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: role === item.id ? '2px solid #1e3a8a' : '1px solid #cbd5e1',
                  backgroundColor: role === item.id ? '#eff6ff' : 'white',
                  color: role === item.id ? '#1e3a8a' : '#475569',
                  fontWeight: role === item.id ? 'bold' : 'normal',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Họ và tên</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Ví dụ: Nguyễn Văn A"
            style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Email liên hệ</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@domain.com"
            style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Mật khẩu</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '0' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Xác nhận mật khẩu</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '0' }}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản →'}
        </button>
      </form>

      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '15px', marginTop: '20px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold', marginLeft: '5px' }}>Đăng nhập ngay</Link>
        </p>
      </div>
    </AuthLayout>
  );
}