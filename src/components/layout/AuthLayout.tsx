import { type ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode; // Chứa Form Đăng nhập hoặc Đăng ký
  leftContent: ReactNode; // Chứa Text và Mockup cột trái
}

export default function AuthLayout({ children, leftContent }: AuthLayoutProps) {
  return (
    // Bật sẵn thanh cuộn (overflowY: 'scroll') để trang không bị giật ngang khi đổi qua đổi lại
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', margin: '-8px', overflowY: 'scroll' }}>
      
      {/* ================= CỘT TRÁI (CỐ ĐỊNH) ================= */}
      <div style={{ flex: 1, backgroundColor: '#0b192c', color: 'white', padding: '40px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* Logo đứng im */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#1e3a8a', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>🎓</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>UniPortfolio Hub</h2>
              <p style={{ margin: 0, fontSize: '10px', color: '#f59e0b', letterSpacing: '1px', fontWeight: 'bold' }}>ACADEMIC VERIFICATION ECOSYSTEM</p>
            </div>
          </div>
        </div>

        {/* Nội dung thay đổi (Khóa cứng chiều cao 350px để khung không bị thò thụt) */}
        <div style={{ maxWidth: '450px', height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {leftContent}
        </div>

        {/* Footer đứng im */}
        <div>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
            Hệ thống quản lý hồ sơ học thuật & Chứng thực năng lực sinh viên.
          </p>
        </div>

      </div>

      {/* ================= CỘT PHẢI (CHỨA FORM) ================= */}
      <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        {/* Khóa cứng chiều cao form để nó không nhảy lên nhảy xuống */}
        <div style={{ width: '100%', maxWidth: '450px', minHeight: '550px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {children}
        </div>
      </div>
    </div>
  );
}