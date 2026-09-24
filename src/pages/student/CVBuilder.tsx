import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import BusinessCardModal from '../../components/qr/BusinessCardModal';
import { analyzeAndTailorCV, type AICVAnalysisResult } from '../../services/aiCvService';
import { RenderCVTemplate, type CVTemplateType } from '../../components/cv/CVTemplates';
import { Sparkles, Printer, QrCode, CheckCircle2, AlertCircle, LayoutTemplate } from 'lucide-react';

interface StudentProfile {
  full_name?: string;
  major?: string;
  university?: string;
  gpa?: string;
  bio?: string;
  skills?: string[];
  username?: string;
}

interface Project {
  id: string;
  title: string;
  role?: string;
  project_type?: string;
  description?: string;
  is_verified?: boolean;
  instructor?: string;
  tags?: string[];
}

interface Achievement {
  id: string;
  title: string;
  category?: string;
}

interface Certificate {
  id: string;
  title: string;
  issuer: string;
}

export default function CVBuilder() {
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  // States
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  // Styling & Customization
  const [primaryColor, setPrimaryColor] = useState('#1e3a8a');
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplateType>('classic');

  // AI JD Matcher States
  const [jdText, setJdText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AICVAnalysisResult | null>(null);

  // Selection States
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [customSummary, setCustomSummary] = useState('');

  // Business Card Modal
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [profileRes, projectsRes, achievementsRes, certsRes] = await Promise.all([
      supabase.from('student_profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('projects').select('*').eq('student_id', user.id).order('created_at', { ascending: false }),
      supabase.from('achievements').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('certificates').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data as StudentProfile);
      setCustomSummary(profileRes.data.bio || '');
    }
    if (projectsRes.data) {
      setProjects(projectsRes.data as Project[]);
      setSelectedProjectIds(projectsRes.data.slice(0, 3).map((p: Project) => p.id));
    }
    if (achievementsRes.data) setAchievements(achievementsRes.data as Achievement[]);
    if (certsRes.data) setCertificates(certsRes.data as Certificate[]);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      await fetchAllData();
    };
    loadData();
  }, [fetchAllData]);

  // Handle AI Matching
  const handleRunAiMatch = async () => {
    if (!jdText.trim()) {
      alert("Vui lòng dán nội dung Job Description (JD) vào ô bên dưới!");
      return;
    }
    setAnalyzing(true);
    try {
      const result = await analyzeAndTailorCV(
        jdText,
        profile?.skills || [],
        projects,
        certificates
      );

      setAiResult(result);
      setCustomSummary(result.summaryText);
      setSelectedProjectIds(result.recommendedProjectIds);

      // Save analysis to generated_cvs table in Supabase
      if (user?.id) {
        await supabase.from('generated_cvs').insert({
          student_id: user.id,
          target_job_title: jdText.slice(0, 50) + '...',
          target_jd_text: jdText,
          match_score: result.matchScore,
          summary_text: result.summaryText,
          selected_projects: result.recommendedProjectIds,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleProjectSelect = (id: string) => {
    setSelectedProjectIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectedProjectsList = projects.filter(p => selectedProjectIds.includes(p.id));
  const verifiedCount = projects.filter(p => p.is_verified).length;

  return (
    <div style={{ padding: '0', width: '100%', boxSizing: 'border-box' }}>
        
        {/* CSS @media print Rules for Perfect PDF Printing */}
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #cv-preview-a4, #cv-preview-a4 * {
              visibility: visible !important;
            }
            #cv-preview-a4 {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 !important;
              padding: 12mm !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @page {
              size: A4 portrait;
              margin: 0;
            }
          }
        `}</style>

        {/* Header */}
        <header style={{ height: '70px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            <span>Portal</span> <span style={{ margin: '0 8px' }}>/</span> <span style={{ color: '#0f172a', fontWeight: '500' }}>AI CV Builder & Smart Card</span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setIsCardModalOpen(true)}
              style={{ padding: '9px 16px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <QrCode size={16} /> Thẻ QR Business Card
            </button>

            <button
              onClick={handlePrint}
              style={{ padding: '9px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)' }}
            >
              <Printer size={16} /> Xuất PDF
            </button>
          </div>
        </header>

        {loading ? (
          <div style={{ padding: '30px' }}>⏳ Đang tổng hợp dữ liệu hồ sơ...</div>
        ) : (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            
            {/* CỘT TRÁI: BẢNG BỘ ĐIỀU KHIỂN & AI JD MATCHER */}
            <div style={{ width: '420px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px', boxSizing: 'border-box' }}>
              
              {/* SELECTOR MẪU CV (TEMPLATES) */}
              <div style={{ marginBottom: '25px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', color: '#0f172a' }}>
                  <LayoutTemplate size={16} color="#1e3a8a" /> Chọn Mẫu Giao Diện CV (Templates)
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'classic', label: '📄 Modern Classic', desc: '2 Cột Hiện Đại' },
                    { id: 'minimal', label: '📑 Minimalist', desc: '1 Cột Tối Giản' },
                    { id: 'tech', label: '💻 Tech Specialist', desc: 'Sidebar Nổi Bật' },
                    { id: 'executive', label: '🎓 Executive', desc: 'Học Thuật Trang Nhã' }
                  ].map(tmpl => (
                    <button
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl.id as CVTemplateType)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: selectedTemplate === tmpl.id ? '2px solid #1e3a8a' : '1px solid #cbd5e1',
                        backgroundColor: selectedTemplate === tmpl.id ? '#eff6ff' : 'white',
                        color: selectedTemplate === tmpl.id ? '#1e3a8a' : '#475569',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{tmpl.label}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{tmpl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* KHU VỰC AI JD MATCHER */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '18px', borderRadius: '12px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Sparkles size={18} color="#1d4ed8" />
                  <h3 style={{ margin: 0, fontSize: '15px', color: '#1e40af', fontWeight: 'bold' }}>AI CV Engine (So Khớp JD)</h3>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#3b82f6', lineHeight: '1.5' }}>
                  Dán nội dung Mô tả Công việc (JD) của nhà tuyển dụng vào đây để AI tự động chọn đồ án, trích xuất kỹ năng & tính Match Score %.
                </p>

                <textarea
                  rows={4}
                  placeholder="Dán nội dung JD tuyển dụng tại đây (Ví dụ: Yêu cầu React, TypeScript, Tailwind, REST API...)..."
                  value={jdText}
                  onChange={e => setJdText(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #93c5fd', fontSize: '12px', boxSizing: 'border-box', marginBottom: '12px' }}
                />

                <button
                  onClick={handleRunAiMatch}
                  disabled={analyzing}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {analyzing ? '⚡ AI Đang Phân Tích JD...' : '⚡ Phân Tích & Tối Ưu CV Bằng AI'}
                </button>
              </div>

              {/* KẾT QUẢ AI PHÂN TÍCH */}
              {aiResult && (
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>🎯 Match Score với JD:</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: aiResult.matchScore >= 80 ? '#059669' : '#d97706' }}>
                      {aiResult.matchScore}%
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ width: `${aiResult.matchScore}%`, height: '100%', backgroundColor: aiResult.matchScore >= 80 ? '#10b981' : '#f59e0b' }}></div>
                  </div>

                  {aiResult.matchingKeywords.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#059669', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Từ khóa khớp trong hồ sơ:
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {aiResult.matchingKeywords.map(k => (
                          <span key={k} style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '4px' }}>{k}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResult.missingKeywords.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#d97706', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={12} /> Gợi ý bổ sung kỹ năng:
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {aiResult.missingKeywords.map(k => (
                          <span key={k} style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '4px' }}>{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TÙY CHỈNH GIAO DIỆN */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Màu sắc chủ đạo CV</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['#1e3a8a', '#059669', '#b91c1c', '#7c3aed', '#0f172a'].map(color => (
                    <div
                      key={color}
                      onClick={() => setPrimaryColor(color)}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: color, cursor: 'pointer', border: primaryColor === color ? '3px solid #cbd5e1' : 'none' }}
                    />
                  ))}
                </div>
              </div>

              {/* CHỌN ĐỒ ÁN HIỂN THỊ */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Đồ án chọn đưa vào CV ({selectedProjectIds.length}/{projects.length})</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projects.map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedProjectIds.includes(p.id)}
                        onChange={() => toggleProjectSelect(p.id)}
                      />
                      <span>{p.title}</span>
                      {p.is_verified && <span style={{ fontSize: '10px', color: '#059669', fontWeight: 'bold' }}>🛡️ Verified</span>}
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* CỘT PHẢI: KHU VỰC LIVE PREVIEW (BẢN CV CHUẨN A4) */}
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', justifyContent: 'center', backgroundColor: '#64748b' }}>
              
              <div
                ref={printRef}
                id="cv-preview-a4"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  backgroundColor: 'white',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  padding: '30px',
                  boxSizing: 'border-box',
                }}
              >
                <RenderCVTemplate
                  template={selectedTemplate}
                  data={{
                    profile,
                    userEmail: user?.email || '',
                    summary: customSummary,
                    primaryColor,
                    selectedProjects: selectedProjectsList,
                    certificates,
                    achievements
                  }}
                />
              </div>

            </div>

          </div>
        )}

      {/* SMART BUSINESS CARD MODAL */}
      <BusinessCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        studentName={profile?.full_name || user?.email?.split('@')[0] || 'Sinh Viên'}
        major={profile?.major || 'Công Nghệ Thông Tin'}
        university={profile?.university || 'Đại Học Bách Khoa'}
        email={user?.email || ''}
        username={profile?.username || user?.id}
        skills={profile?.skills || []}
        verifiedCount={verifiedCount}
      />
    </div>
  );
}