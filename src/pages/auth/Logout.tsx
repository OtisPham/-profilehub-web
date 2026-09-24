import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';

export default function Logout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    // Context sẽ tự động cập nhật trạng thái user thành null, 
    // PrivateRoute sẽ tự động đẩy người dùng về trang /login
     navigate('/login'); 
  };

  const handleCancel = () => {
    navigate('/dashboard'); // Quay lại Dashboard nếu hủy
  };

  // Tạo mock data dựa trên email người dùng hiện tại để hiển thị giống thiết kế
  const displayName = user?.email ? user.email.split('@')[0] : 'Sinh viên';
  const avatarText = user?.email ? user.email.substring(0, 2).toUpperCase() : 'SV';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#1e3a8a', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px' }}>🎓</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>UniPortfolio Hub <span style={{ fontSize: '10px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px' }}>V2.4 LTS</span></h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Academic Credential & Talent Ecosystem</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
            🔒 Secure Institutional Session
          </span>
          <Link to="/dashboard" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
            ← Quay lại Dashboard
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        
        {/* Mock Tabs */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', backgroundColor: 'white', padding: '10px 20px', borderRadius: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '12px', color: '#64748b' }}>
          <span style={{ fontWeight: '600' }}>Trạng thái minh họa:</span>
          <span style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '2px 10px', borderRadius: '12px', fontWeight: 'bold' }}>1. Hộp thoại Xác nhận</span>
          <span>2. Đang đăng xuất</span>
          <span>3. Đã đăng xuất xong</span>
          <span>4. Lỗi đồng bộ phiên</span>
        </div>

        {/* LOGOUT CARD */}
        <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '480px', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)', textAlign: 'center' }}>
          
          <div style={{ width: '60px', height: '60px', backgroundColor: '#f1f5f9', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto', fontSize: '24px', color: '#3b82f6' }}>
            🚪
          </div>

          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#0f172a' }}>Sign out of your account?</h2>
          <p style={{ margin: '0 0 30px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.6', padding: '0 20px' }}>
            You will need to sign in again with your University SSO or institutional credentials to access your verified portfolio and project dossiers.
          </p>

          {/* User Info Box */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left', marginBottom: '30px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#1e3a8a', color: 'white', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '18px' }}>
              {avatarText}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{displayName}</strong>
                <span style={{ fontSize: '11px', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>Student - IT Faculty</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{user?.email}</div>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>MSSV: <strong style={{ color: '#475569' }}>BK-2022-XXXX</strong></span>
                <span>•</span>
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ fontSize: '8px' }}>●</span> Hồ sơ công khai (Active)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <button onClick={handleCancel} disabled={isLoggingOut} style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSignOut} disabled={isLoggingOut} style={{ flex: 1, padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
              {isLoggingOut ? 'Signing out...' : 'Sign Out 🚪'}
            </button>
          </div>

          {/* Security Notice */}
          <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left' }}>
            <span>🛡️</span>
            <span>Dữ liệu đồ án, kỹ năng đã thẩm định và bản thảo CV được tự động lưu trữ an toàn mã hóa chuẩn AES-256.</span>
          </div>
        </div>

        <p style={{ marginTop: '30px', fontSize: '12px', color: '#94a3b8', textAlign: 'center', maxWidth: '500px', lineHeight: '1.6' }}>
          Hệ thống hỗ trợ cơ chế SSO (Single Sign-On). Sau khi đăng xuất tại đây, phiên làm việc trên các dịch vụ tích hợp khác của trường đại học sẽ được đảm bảo an toàn.
        </p>

      </main>

      {/* FOOTER */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 30px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', backgroundColor: 'white' }}>
        <div>© 2026 UniPortfolio Hub • Hệ thống Quản trị & Xác thực Năng lực Sinh viên Đại học</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Chính sách Bảo mật</a>
          <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Session Security Guide</a>
          <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Institutional IT Support</a>
          <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>Trợ giúp SSO ↗</a>
        </div>
      </footer>
    </div>
  );
}