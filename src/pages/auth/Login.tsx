import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('student'); // student, teacher, business
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Đẩy user vào dashboard nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email hoặc mật khẩu không chính xác.");
    }else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', margin: '-8px' }}>
      
      {/* ================= CỘT TRÁI (DARK BLUE PANEL) ================= */}
      <div style={{ 
        flex: 1, 
        backgroundColor: '#0b192c', 
        color: 'white', 
        padding: '40px 60px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between' 
      }}>
        
        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#1e3a8a', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>🎓</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>UniPortfolio Hub</h2>
              <p style={{ margin: 0, fontSize: '10px', color: '#f59e0b', letterSpacing: '1px', fontWeight: 'bold' }}>ACADEMIC VERIFICATION ECOSYSTEM</p>
            </div>
          </div>
        </div>

        {/* Nội dung chính cột trái */}
        <div style={{ maxWidth: '450px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '20px' }}>
            Showcase Your <span style={{ color: '#f59e0b' }}>Potential.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '40px' }}>
            Build your academic portfolio, verify your skills with faculty and connect directly with industry partners.
          </p>

          {/* Mockup Card Sinh viên */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <span style={{ backgroundColor: '#f59e0b', color: '#0b192c', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>✓ Verified by Faculty</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>NM</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Nguyễn Nhật Minh <span style={{ color: '#10b981' }}>●</span></h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Khoa Khoa Học & Kỹ Thuật Máy Tính • K21</p>
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: '#f59e0b' }}>🎓 Academic Capstone Project</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>Điểm A+ (9.4/10)</span>
              </div>
              <h5 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>BK-SmartMeter (IoT Telemetry Platform)</h5>
            </div>
          </div>
        </div>

        {/* Footer cột trái */}
        <div>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>Connecting Students, Faculty and Industry:</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '11px' }}>🎓 Sinh viên</span>
            <span style={{ padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '11px' }}>👨‍🏫 Giảng viên</span>
            <span style={{ padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '11px' }}>🏢 Doanh nghiệp đối tác</span>
          </div>
        </div>

      </div>

      {/* ================= CỘT PHẢI (WHITE PANEL - LOGIN FORM) ================= */}
      <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '450px' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <h5 style={{ margin: 0, color: '#1e3a8a', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>UNIVERSITY PORTFOLIO HUB • AUTHENTICATION PORTAL</h5>
            <h2 style={{ margin: '10px 0', fontSize: '32px', color: '#0f172a' }}>Welcome Back</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Sign in to continue to your verified academic portfolio.</p>
          </div>

          <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '10px' }}>Đăng nhập với tư cách:</p>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', padding: '5px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
            <button onClick={() => setActiveTab('student')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', backgroundColor: activeTab === 'student' ? '#1e3a8a' : 'transparent', color: activeTab === 'student' ? 'white' : '#64748b' }}>
              🎓 Sinh viên
            </button>
            <button onClick={() => setActiveTab('teacher')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', backgroundColor: activeTab === 'teacher' ? '#1e3a8a' : 'transparent', color: activeTab === 'teacher' ? 'white' : '#64748b' }}>
              👨‍🏫 Giảng viên
            </button>
            <button onClick={() => setActiveTab('business')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', backgroundColor: activeTab === 'business' ? '#1e3a8a' : 'transparent', color: activeTab === 'business' ? 'white' : '#64748b' }}>
              🏢 Doanh nghiệp
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 15px 0', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</p>}
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>University Email / Student ID</label>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>(VD: sv2020.hub@uni.edu.vn)</span>
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nguyen.nhatminh@uni.edu.vn" 
                required
                style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} 
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
            Password
          </label>
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

        
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
              <input type="checkbox" id="remember" style={{ cursor: 'pointer' }} />
              <label htmlFor="remember" style={{ fontSize: '13px', color: '#475569', cursor: 'pointer' }}>Remember my session on this computer</label>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
              {loading ? 'Đang đăng nhập...' : 'Sign in to Portfolio →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
            <span style={{ padding: '0 15px', fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>HOẶC ĐĂNG NHẬP LIÊN KẾT</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          </div>

          {/* Nút SSO & Chưa có tài khoản */}
          <button style={{ width: '100%', padding: '12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', color: '#334155', cursor: 'pointer', marginBottom: '20px' }}>
            <span>⊞</span> Continue with University SSO (Microsoft 365)
          </button>

          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '15px', display: 'flex', gap: '10px' }}>
            <span style={{ color: '#3b82f6' }}>ℹ️</span>
            <div>
              <h5 style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#0f172a' }}>Chưa kích hoạt tài khoản?</h5>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Sinh viên và Giảng viên liên hệ Phòng Đào tạo & CTSV để nhận mã định danh xác thực hồ sơ điện tử. 
                <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', marginLeft: '5px' }}>Đăng ký ngay</Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}