import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Code2, Award, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';
import { getPublicVerificationRecord, type PublicVerificationRecord } from '../../services/verificationService';
import VSCodeViewerModal from '../../components/common/VSCodeViewerModal';

export default function PublicVerificationView() {
  const { verificationCode } = useParams<{ verificationCode: string }>();
  const [record, setRecord] = useState<PublicVerificationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showVSCodeModal, setShowVSCodeModal] = useState(false);

  useEffect(() => {
    async function loadRecord() {
      if (!verificationCode) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getPublicVerificationRecord(verificationCode);
        setRecord(data);
      } catch (err) {
        console.error('Error fetching verification record:', err);
        setRecord(null);
      } finally {
        setLoading(false);
      }
    }
    loadRecord();
  }, [verificationCode]);

  const handleCopyHash = () => {
    if (record?.verification_hash) {
      navigator.clipboard.writeText(record.verification_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
          <p style={{ fontSize: '15px', fontWeight: '500' }}>Đang xác thực thông tin đồ án trên ProfileHub Gateway...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #fecaca', padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444' }}>
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#991b1b', margin: '0 0 10px' }}>Không Tìm Thấy Bản Ghi Xác Thực</h2>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 24px' }}>
            Mã tra cứu <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a', fontWeight: 'bold' }}>{verificationCode}</code> không tồn tại hoặc đồ án này chưa được xác thực bởi Giảng viên.
          </p>
          <Link to="/" style={{ display: 'inline-block', backgroundColor: '#0f172a', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}>
            Quay Về Trang Chủ ProfileHub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '60px' }}>
      
      {/* Public Header */}
      <header style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 0', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🛡️</span>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, letterSpacing: '-0.02em' }}>ProfileHub Academic Gateway</h1>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Cổng Trực Tuyến Tra Cứu & Xác Thực Đồ Án Học Thuật</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1e293b', padding: '6px 14px', borderRadius: '20px', border: '1px solid #334155' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>Official Verified Seal</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1000px', margin: '30px auto 0', padding: '0 20px' }}>
        
        {/* Verification Status Banner */}
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', backgroundColor: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#065f46' }}>Đồ Án Đã Được Giảng Viên Xác Thực</span>
                <span style={{ backgroundColor: '#10b981', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>VERIFIED BADGE 🛡️</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                Mã xác thực: <strong>{record.verification_code}</strong> • Ngày xác thực: <strong>{new Date(record.verified_at).toLocaleDateString('vi-VN')}</strong>
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleCopyHash}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', border: '1px solid #a7f3d0', color: '#047857', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Đã Sao Chép Hash!' : 'Sao Chép Hash Xác Thực'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Column 1: Project Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Project Details Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                {record.project.project_type || 'Đồ Án Chuyên Ngành'}
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px', lineHeight: '1.3' }}>
                {record.project.title}
              </h2>

              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px', whiteSpace: 'pre-line' }}>
                {record.project.description || 'Chưa có mô tả đồ án.'}
              </p>

              {/* Tech Stack */}
              {record.project.tags && record.project.tags.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>Công Nghệ Trọng Tâm (Tech Stack):</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {record.project.tags.map((tag, idx) => (
                      <span key={idx} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links & VS Code Inspector Modal Trigger */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                {record.project.github_url && (
                  <button
                    onClick={() => setShowVSCodeModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0f172a', color: 'white', padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                  >
                    <Code2 size={15} color="#38bdf8" /> 💻 Duyệt GitHub Repo (VS Code Theme)
                  </button>
                )}

                {record.project.demo_url && (
                  <a href={record.project.demo_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#2563eb', color: 'white', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                    <ExternalLink size={14} /> 🌐 Live Web Demo ↗
                  </a>
                )}

                {record.project.figma_url && (
                  <a href={record.project.figma_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ec4899', color: 'white', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                    <ExternalLink size={14} /> 🎨 Design UI/UX (Figma) ↗
                  </a>
                )}

                {record.project.doc_url && (
                  <a href={record.project.doc_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#059669', color: 'white', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                    <ExternalLink size={14} /> 📄 Báo Cáo Spec (Doc) ↗
                  </a>
                )}
              </div>
            </div>

            {/* Lecturer Assessment Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Award size={20} color="#059669" />
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Nhận Xét & Đánh Giá Từ Giảng Viên</h3>
              </div>

              {record.project.score && (
                <div style={{ display: 'inline-block', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', marginBottom: '14px' }}>
                  🎯 Điểm Chấm Đồ Án: {record.project.score}
                </div>
              )}

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10b981', fontSize: '14px', color: '#334155', lineHeight: '1.6', fontStyle: 'italic' }}>
                "{record.project.teacher_feedback || 'Đồ án đáp ứng đầy đủ yêu cầu kỹ thuật và được phê duyệt xác thực bởi bộ môn.'}"
              </div>
            </div>
          </div>

          {/* Column 2: Verifier & Student Profile Proof */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Student Proof Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Tác Giả Đồ Án (Sinh Viên)</div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#475569' }}>
                  {record.student.full_name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 2px' }}>{record.student.full_name}</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{record.student.major} • {record.student.university}</p>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Đã xác minh tư cách sinh viên trên hệ thống ProfileHub</span>
              </div>
            </div>

            {/* Verifying Lecturer Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Người Phê Duyệt (Giảng Viên)</div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  👨‍🏫
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 2px' }}>{record.teacher.full_name}</h4>
                  <p style={{ fontSize: '13px', color: '#059669', fontWeight: '500', margin: 0 }}>{record.teacher.email}</p>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                Giảng viên trực tiếp chấm điểm, kiểm định tính chân thực của mã nguồn và cấp con dấu Verified Badge 🛡️.
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* VS Code Theme Inspector Modal */}
      <VSCodeViewerModal
        isOpen={showVSCodeModal}
        onClose={() => setShowVSCodeModal(false)}
        fileUrl={record.project.demo_url}
        githubUrl={record.project.github_url}
        fileName={`${record.project.title.toLowerCase().replace(/\s+/g, '-')}.html`}
      />

      {/* Footer */}
      <footer style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
        <p>© 2026 ProfileHub Academic Verification Network • Powered by Evidence-Based Matching</p>
      </footer>

    </div>
  );
}
