import { useState } from 'react';
import { FileText, Code2, Globe, ExternalLink, Eye, Award, CheckCircle2 } from 'lucide-react';
import VerifiedBadge from '../common/VerifiedBadge';

export interface ProjectData {
  id: string;
  title: string;
  description?: string;
  demo_url?: string;
  github_url?: string;
  project_type?: string;
  score?: string;
  is_verified?: boolean;
  verification_status?: string;
  instructor?: string;
  tags?: string[];
  image_url?: string;
  teacher_feedback?: string;
  role?: string;
  team_size?: string;
}

interface ProjectFilePreviewHeaderProps {
  project: ProjectData;
  onOpenPreview?: () => void;
}

export default function ProjectFilePreviewHeader({ project, onOpenPreview }: ProjectFilePreviewHeaderProps) {
  const [showIframeModal, setShowIframeModal] = useState(false);

  // Check if image_url is a real user-uploaded image (not empty and not unsplash placeholder)
  const isRealUserImage = project.image_url && 
    !project.image_url.includes('unsplash.com') && 
    !project.image_url.includes('via.placeholder') &&
    (project.image_url.startsWith('http') || project.image_url.startsWith('data:'));

  // Determine file/document type icon
  const getDocTypeInfo = () => {
    const pType = (project.project_type || '').toLowerCase();
    if (pType.includes('tốt nghiệp') || pType.includes('khóa luận')) {
      return { icon: FileText, label: '📄 Báo Cáo Khóa Luận PDF', bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' };
    }
    if (pType.includes('chuyên ngành') || pType.includes('môn học')) {
      return { icon: Code2, label: '💻 Đồ Án Mã Nguồn & API', bg: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' };
    }
    if (pType.includes('nghiên cứu')) {
      return { icon: Award, label: '📊 Báo Cáo NCKH Official', bg: 'linear-gradient(135deg, #047857 0%, #10b981 100%)' };
    }
    return { icon: Globe, label: '🌐 Web Prototype / System File', bg: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' };
  };

  const docType = getDocTypeInfo();
  const IconComponent = docType.icon;

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenPreview) {
      onOpenPreview();
    } else {
      setShowIframeModal(true);
    }
  };

  return (
    <>
      <div 
        style={{
          height: '160px',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          background: isRealUserImage ? `url(${project.image_url}) center/cover no-repeat` : docType.bg,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '12px 14px',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header Overlay Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            color: '#f8fafc',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {project.project_type || 'Đồ Án'}
          </span>

          {project.score && (
            <span style={{
              fontSize: '11px',
              fontWeight: 'bold',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              padding: '3px 8px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }}>
              Điểm: {project.score}
            </span>
          )}
        </div>

        {/* Center Document Reader Layout (When no real image) */}
        {!isRealUserImage && (
          <div style={{ zIndex: 2, margin: 'auto 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <IconComponent size={16} color="white" />
              </div>
              <span style={{ fontSize: '11px', color: '#e0f2fe', fontWeight: 'bold' }}>
                {docType.label}
              </span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.title}
            </div>
          </div>
        )}

        {/* Bottom Document Preview Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {project.tags && project.tags.length > 0 && (
              <span>🏷️ {project.tags.slice(0, 2).join(', ')}</span>
            )}
          </div>

          <button
            onClick={handlePreviewClick}
            style={{
              padding: '4px 10px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#0f172a',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'all 0.2s'
            }}
          >
            <Eye size={12} color="#1e3a8a" /> Bản đọc trước file
          </button>
        </div>

        {/* Overlay Dark Tint */}
        {!isRealUserImage && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)', zIndex: 1 }} />
        )}
      </div>

      {/* IN-APP DOCUMENT READER MODAL */}
      {showIframeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', backgroundColor: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>
                  📖 XEM BẢN ĐỌC TRƯỚC TÀI LIỆU & ĐỒ ÁN
                </div>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '16px', color: 'white' }}>
                  {project.title}
                </h3>
              </div>

              <button
                onClick={() => setShowIframeModal(false)}
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                ✕ Đóng Reader
              </button>
            </div>

            {/* Document Content Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
              
              {/* Document Overview Metadata */}
              <div style={{ backgroundColor: 'white', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', backgroundColor: '#eff6ff', padding: '3px 10px', borderRadius: '4px' }}>
                      {project.project_type || 'Đồ Án Tốt Nghiệp'}
                    </span>
                    {project.score && <span style={{ marginLeft: '10px', fontSize: '12px', fontWeight: 'bold', color: '#d97706' }}>Điểm số: {project.score}</span>}
                  </div>

                  {(project.is_verified || project.verification_status === 'verified') && (
                    <VerifiedBadge teacherName={project.instructor} size="md" />
                  )}
                </div>

                <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: '0 0 15px 0' }}>
                  {project.description || 'Chưa có thông tin mô tả chi tiết.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px', backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '6px' }}>
                  <div><strong>Vai trò:</strong> {project.role || 'Thành viên'}</div>
                  <div><strong>Quy mô nhóm:</strong> {project.team_size || '1 thành viên'}</div>
                  <div><strong>Giảng viên HĐ:</strong> {project.instructor || 'Chưa ghi nhận'}</div>
                </div>
              </div>

              {/* Document File / Web Live Preview Frame */}
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <FileText size={18} color="#1e3a8a" /> Bản Đọc Trước Báo Cáo Kỹ Thuật & Tài Liệu Trực Tuyến
                </h4>

                {project.demo_url ? (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', height: '350px' }}>
                    <iframe
                      src={project.demo_url}
                      title="Project Preview"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                ) : (
                  <div style={{ padding: '30px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <CheckCircle2 size={36} color="#059669" style={{ marginBottom: '10px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>
                      Tài Liệu Đồ Án Đã Được Kiểm Định & Lưu Trực Tiếp
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', maxWidth: '500px', margin: '0 auto 15px auto' }}>
                      Tài liệu báo cáo đồ án, bản vẽ kiến trúc và kết quả thực nghiệm đã được Giảng viên kiểm tra minh bạch.
                    </p>
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: '8px 16px', backgroundColor: '#0f172a', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <ExternalLink size={14} /> Mở Mã Nguồn GitHub / GitLab
                      </a>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
