import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  teacherName?: string;
  verifiedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerifiedBadge({ teacherName, verifiedAt, size = 'md' }: VerifiedBadgeProps) {
  const formattedDate = verifiedAt ? new Date(verifiedAt).toLocaleDateString('vi-VN') : '';

  const sizeStyles = {
    sm: { padding: '3px 8px', fontSize: '11px', iconSize: 14 },
    md: { padding: '5px 12px', fontSize: '12px', iconSize: 16 },
    lg: { padding: '8px 16px', fontSize: '13px', iconSize: 18 },
  }[size];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: '#ecfdf5',
        color: '#059669',
        border: '1px solid #a7f3d0',
        borderRadius: '20px',
        fontWeight: 'bold',
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
      title={teacherName ? `Xác thực bởi Giảng viên: ${teacherName} ${formattedDate ? `(${formattedDate})` : ''}` : 'Đồ án đã được xác thực chính thức'}
    >
      <ShieldCheck size={sizeStyles.iconSize} color="#059669" />
      <span>Verified Academic Project</span>
      {teacherName && (
        <span style={{ fontWeight: 'normal', color: '#047857', borderLeft: '1px solid #6ee7b7', paddingLeft: '6px', marginLeft: '2px' }}>
          by {teacherName}
        </span>
      )}
    </div>
  );
}
