import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import type { UserRole } from '../../types/database';
import { Menu, X, LogOut, Shield, Award, FileText, LayoutDashboard, UserCheck, Briefcase, Trophy, FolderKanban, Star, Kanban, Sparkles, Building2, GraduationCap, Target } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const { user, userRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getMenuStyles = (path: string) => {
    const isActive = location.pathname.includes(path);
    const activeBg = userRole === 'teacher' ? '#047857' : userRole === 'recruiter' ? '#6d28d9' : '#1e3a8a';
    const activeBorder = userRole === 'teacher' ? '#34d399' : userRole === 'recruiter' ? '#c084fc' : '#f59e0b';

    return {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '9px 18px', // Compact height for fast clicking
      backgroundColor: isActive ? activeBg : 'transparent',
      color: isActive ? 'white' : '#475569',
      textDecoration: 'none',
      fontWeight: isActive ? '600' : '500',
      borderLeft: isActive ? `4px solid ${activeBorder}` : '4px solid transparent',
      transition: 'all 0.15s ease',
      fontSize: '13.5px',
      margin: '2px 0',
    };
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return { label: '👨‍🏫 GIẢNG VIÊN', color: '#10b981', bg: '#ecfdf5' };
      case 'recruiter':
        return { label: '🏢 NHÀ TUYỂN DỤNG', color: '#8b5cf6', bg: '#f5f3ff' };
      default:
        return { label: '👨‍🎓 SINH VIÊN', color: '#3b82f6', bg: '#eff6ff' };
    }
  };

  const badge = getRoleBadge(userRole);

  const navContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header - Compact Padding */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🎓 PROFILEHUB
        </div>
        <div style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', backgroundColor: badge.bg, color: badge.color }}>
          {badge.label}
        </div>
      </div>

      {/* Navigation Links - Ergonomic Compact Spacing */}
      <nav style={{ padding: '10px 0', flex: 1, overflowY: 'auto' }}>
        {userRole === 'student' && (
          <>
            <div style={{ padding: '0 18px', marginBottom: '4px', fontSize: '10.5px', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.5px' }}>PORTFOLIO SINH VIÊN</div>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={getMenuStyles('/dashboard')}><LayoutDashboard size={17} /> Dashboard</Link>
            <Link to="/profile" onClick={() => setMobileOpen(false)} style={getMenuStyles('/profile')}><UserCheck size={17} /> Hồ Sơ Cá Nhân</Link>
            <Link to="/projects" onClick={() => setMobileOpen(false)} style={getMenuStyles('/projects')}><FolderKanban size={17} /> Quản Lý Đồ Án</Link>
            <Link to="/certificates" onClick={() => setMobileOpen(false)} style={getMenuStyles('/certificates')}><Award size={17} /> Chứng Chỉ & Bằng Cấp</Link>
            <Link to="/achievements" onClick={() => setMobileOpen(false)} style={getMenuStyles('/achievements')}><Trophy size={17} /> Thành Tích & Giải Thưởng</Link>

            <div style={{ padding: '0 18px', marginTop: '14px', marginBottom: '4px', fontSize: '10.5px', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.5px' }}>CÔNG CỤ NGHỀ NGHIỆP</div>
            <Link to="/student/jobs" onClick={() => setMobileOpen(false)} style={getMenuStyles('/student/jobs')}><Briefcase size={17} color="#3b82f6" /> Bài Đăng Tuyển Dụng</Link>
            <Link to="/cv-builder" onClick={() => setMobileOpen(false)} style={getMenuStyles('/cv-builder')}><FileText size={17} /> AI CV Builder (Dán JD)</Link>
            <Link to="/portfolio-match" onClick={() => setMobileOpen(false)} style={getMenuStyles('/portfolio-match')}><Target size={17} color="#3b82f6" /> AI Portfolio Match & Gap</Link>
            <Link to="/interview-prep" onClick={() => setMobileOpen(false)} style={getMenuStyles('/interview-prep')}><Sparkles size={17} color="#3b82f6" /> Luyện Phỏng Vấn AI</Link>
          </>
        )}

        {userRole === 'teacher' && (
          <>
            <div style={{ padding: '0 18px', marginBottom: '4px', fontSize: '10.5px', color: '#10b981', fontWeight: 'bold', letterSpacing: '0.5px' }}>PORTAL GIẢNG VIÊN</div>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={getMenuStyles('/dashboard')}><LayoutDashboard size={17} /> Tổng Quan Khoa/Bộ Môn</Link>
            <Link to="/teacher/profile" onClick={() => setMobileOpen(false)} style={getMenuStyles('/teacher/profile')}><GraduationCap size={17} /> Hồ Sơ Giảng Viên</Link>
            <Link to="/teacher/inbox" onClick={() => setMobileOpen(false)} style={getMenuStyles('/teacher/inbox')}><Shield size={17} /> Duyệt Đồ Án (Verification)</Link>
          </>
        )}

        {userRole === 'recruiter' && (
          <>
            <div style={{ padding: '0 18px', marginBottom: '4px', fontSize: '10.5px', color: '#8b5cf6', fontWeight: 'bold', letterSpacing: '0.5px' }}>PORTAL NHÀ TUYỂN DỤNG</div>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={getMenuStyles('/dashboard')}><LayoutDashboard size={17} /> Bảng Điều Khiển</Link>
            <Link to="/recruiter/profile" onClick={() => setMobileOpen(false)} style={getMenuStyles('/recruiter/profile')}><Building2 size={17} /> Hồ Sơ Doanh Nghiệp</Link>
            <Link to="/recruiter/ai-assistant" onClick={() => setMobileOpen(false)} style={getMenuStyles('/recruiter/ai-assistant')}><Sparkles size={17} color="#8b5cf6" /> AI Tuyển Dụng (Smart)</Link>
            <Link to="/recruiter/search" onClick={() => setMobileOpen(false)} style={getMenuStyles('/recruiter/search')}><Briefcase size={17} /> Tìm Ứng Viên (Verified)</Link>
            <Link to="/recruiter/pipeline" onClick={() => setMobileOpen(false)} style={getMenuStyles('/recruiter/pipeline')}><Kanban size={17} /> Luồng Tuyển Dụng</Link>
            <Link to="/recruiter/saved" onClick={() => setMobileOpen(false)} style={getMenuStyles('/recruiter/saved')}><Star size={17} /> Ứng Viên Đã Lưu</Link>
            <Link to="/recruiter/jobs" onClick={() => setMobileOpen(false)} style={getMenuStyles('/recruiter/jobs')}><Briefcase size={17} /> Tin Tuyển Dụng</Link>
          </>
        )}
      </nav>

      {/* Footer Info & Logout - Compact */}
      <div style={{ padding: '12px 18px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
        <div style={{ fontSize: '11.5px', color: '#475569', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          📧 {user?.email || 'N/A'}
        </div>
        <button
          onClick={() => window.location.href = '/logout'}
          style={{ width: '100%', padding: '8px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <LogOut size={15} /> Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE BAR (Hiển thị trên Màn hình < 1024px) */}
      <div className="mobile-top-bar" style={{
        display: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 20px',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🎓 PROFILEHUB
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: badge.bg, color: badge.color, padding: '3px 8px', borderRadius: '10px' }}>
            {badge.label}
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', padding: '4px' }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '270px',
              height: '100%',
              backgroundColor: 'white',
              boxShadow: '4px 0 15px rgba(0,0,0,0.2)',
            }}
          >
            {navContent}
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (Cố định ở Màn hình >= 1024px) */}
      <aside className="desktop-sidebar" style={{ width: '240px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {navContent}
      </aside>

      {/* Responsive Inline CSS */}
      <style>{`
        @media (max-width: 1023px) {
          .desktop-sidebar { display: none !important; }
          .mobile-top-bar { display: flex !important; }
        }
      `}</style>
    </>
  );
}