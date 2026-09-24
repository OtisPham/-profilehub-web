import { useRef, useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { X, Download, ShieldCheck, Copy, Check, ExternalLink } from 'lucide-react';
import type { Project } from '../../types/database';

interface ProjectQRCodeModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectQRCodeModal({ project, onClose }: ProjectQRCodeModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const verificationCode = project.verification_code || project.id;
  const publicUrl = `${baseUrl}/verify/${verificationCode}`;

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (canvas) {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `QR-Verification-${verificationCode}.png`;
      link.click();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Mã QR Xác Thực Đồ Án</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Academic Verification QR Code</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-block', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>
            <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            VERIFIED BADGE • {verificationCode}
          </div>

          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px', lineHeight: '1.4' }}>
            {project.title}
          </h4>

          {/* QR Container */}
          <div ref={canvasRef} style={{ backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '16px', display: 'inline-block', marginBottom: '20px' }}>
            {/* Hidden canvas for downloading */}
            <div style={{ display: 'none' }}>
              <QRCodeCanvas value={publicUrl} size={300} level="H" includeMargin />
            </div>
            {/* SVG for sharp rendering */}
            <QRCodeSVG value={publicUrl} size={180} level="H" includeMargin fgColor="#0f172a" />
          </div>

          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px', lineHeight: '1.5' }}>
            Dán mã QR này vào <strong>CV PDF, Slide thuyết trình</strong> hoặc trang cá nhân. Nhà tuyển dụng quét mã để xem trực tiếp xác thực từ Giảng viên.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={handleDownloadPNG}
              style={{ width: '100%', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Download size={18} /> Tải Ảnh QR Code (PNG)
            </button>

            <button 
              onClick={handleCopyLink}
              style={{ width: '100%', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              {copied ? 'Đã Sao Chép Link Public!' : 'Sao Chép Link Xác Thực'}
            </button>

            <a 
              href={publicUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', marginTop: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <ExternalLink size={12} /> Thử mở link xác thực trên giao diện công khai
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
