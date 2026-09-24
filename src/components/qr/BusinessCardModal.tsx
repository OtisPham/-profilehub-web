import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, ShieldCheck, Sparkles, X } from 'lucide-react';

interface BusinessCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  major?: string;
  university?: string;
  email?: string;
  username?: string;
  skills?: string[];
  verifiedCount?: number;
}

export default function BusinessCardModal({
  isOpen,
  onClose,
  studentName,
  major = 'Công Nghệ Thông Tin',
  university = 'Đại Học Bách Khoa',
  email = '',
  username = 'student',
  skills = [],
  verifiedCount = 0,
}: BusinessCardModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicProfileUrl = `${window.location.origin}/student/${username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicProfileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById('student-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 25, 25, 250, 250);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_Code_${studentName}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 25px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#1e3a8a" />
            <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>Smart QR Business Card</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
        </div>

        {/* 3D Premium Business Card View */}
        <div style={{ padding: '30px', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
          <div style={{
            width: '100%',
            maxWidth: '420px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            padding: '25px',
            color: 'white',
            boxSizing: 'border-box',
            position: 'relative',
          }}>
            {/* Top Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', color: '#93c5fd' }}>PROFILEHUB DIGITAL CARD</div>
              {verifiedCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#064e3b', color: '#34d399', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                  <ShieldCheck size={12} /> {verifiedCount} VERIFIED
                </div>
              )}
            </div>

            {/* Card Content & Local SVG QR Code */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              
              {/* QR Code Canvas/SVG */}
              <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <QRCodeSVG
                  id="student-qr-svg"
                  value={publicProfileUrl}
                  size={100}
                  fgColor="#1e3a8a"
                  bgColor="#ffffff"
                  level="H"
                />
              </div>

              {/* Student Details */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>{studentName}</h2>
                <div style={{ fontSize: '12px', color: '#93c5fd', fontWeight: '500', marginBottom: '6px' }}>{major}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>{university}</div>
                
                {skills.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {skills.slice(0, 3).map(s => (
                      <span key={s} style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '4px', color: '#e2e8f0' }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '20px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
              <span>📧 {email}</span>
              <span>Scan to view verified CV</span>
            </div>

          </div>

        </div>

        {/* Actions Bar */}
        <div style={{ padding: '20px 25px', backgroundColor: 'white', display: 'flex', gap: '12px' }}>
          <button
            onClick={handleCopyLink}
            style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Share2 size={16} />
            {copied ? 'Đã Sao Chép Link!' : 'Sao Chép Link Profile'}
          </button>

          <button
            onClick={handleDownloadQR}
            style={{ flex: 1, padding: '12px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Download size={16} />
            Tải Mã QR (PNG)
          </button>
        </div>

      </div>
    </div>
  );
}
