import { X, Building2, MapPin, Mail, Phone, Globe, Users, Briefcase, Sparkles } from 'lucide-react';
import { getRecruiterCompanyProfile } from '../../utils/jobSync';

interface RecruiterCompanyModalProps {
  recruiterId?: string;
  jobTitle?: string;
  onClose: () => void;
}

export default function RecruiterCompanyModal({ recruiterId, jobTitle, onClose }: RecruiterCompanyModalProps) {
  const profile = getRecruiterCompanyProfile(recruiterId);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '650px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        position: 'relative'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85, marginBottom: '4px' }}>
              🏢 THÔNG TIN NHÀ TUYỂN DỤNG & CÔNG TY
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0' }}>
              {profile.companyName}
            </h2>
            {jobTitle && (
              <div style={{ fontSize: '12.5px', opacity: 0.9, backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 10px', borderRadius: '12px', display: 'inline-block' }}>
                📌 Vị trí đăng tuyển: <strong>{jobTitle}</strong>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px' }}>
          
          {/* HR Personnel Section */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              👤 Nhân Sự Chịu Trách Nhiệm Tuyển Dụng
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Họ và tên HR:</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', marginTop: '2px' }}>
                  {profile.recruiterName}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Chức danh:</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#475569', marginTop: '2px' }}>
                  Talent Acquisition Specialist / HR Lead
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Email liên hệ:</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={13} /> {profile.email || 'hr@company.com'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Số điện thoại hotline:</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#059669', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={13} /> {profile.phone || '028 3822 9999'}
                </div>
              </div>
            </div>
          </div>

          {/* Company Details Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#1e3a8a" /> Hồ Sơ Chi Tiết Doanh Nghiệp
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase size={12} /> Lĩnh Vực Hoạt Động
                </div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>
                  {profile.industry}
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={12} /> Quy Mô Nhân Sự
                </div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>
                  {profile.companySize}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> Địa Chỉ Trụ Sở Công Ty
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginTop: '4px' }}>
                {profile.companyAddress || 'Tòa nhà Innovation, Quận 1, TP. Hồ Chí Minh'}
              </div>
            </div>

            {profile.website && (
              <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Globe size={12} /> Website Chính Thức
                </div>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '13px', fontWeight: 'bold', color: '#2563eb', textDecoration: 'none', marginTop: '4px', display: 'inline-block' }}
                >
                  {profile.website} ↗
                </a>
              </div>
            )}
          </div>

          {/* Company Bio */}
          {profile.companyBio && (
            <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#6d28d9', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} /> Giới Thiệu Về Môi Trường Làm Việc & Văn Hóa Doanh Nghiệp
              </div>
              <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}>
                {profile.companyBio}
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                backgroundColor: '#1e3a8a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Đóng Cửa Sổ
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
