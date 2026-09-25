import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import {
  parseHiringPrompt,
  generateJobDescription,
  matchCandidatesWithJob,
  type HiringBrief,
  type GeneratedJD,
  type CandidateMatchResult
} from '../../services/aiRecruitmentService';
import { Sparkles, Mail, Star, Kanban, Edit3 } from 'lucide-react';

interface CandidateProfileData {
  id: string;
  full_name: string;
  university?: string;
  major?: string;
  gpa?: string;
  email?: string;
  skills?: string[];
  verified_projects_count: number;
  projects: Array<{ title: string; is_verified?: boolean }>;
}

export default function AIRecruitmentAssistant() {
  const { user } = useAuth();

  // Step flow state: 1: Input -> 2: Brief & JD -> 3: Matched Candidates
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // User input prompt
  const [promptText, setPromptText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Hiring Brief & JD State
  const [hiringBrief, setHiringBrief] = useState<HiringBrief | null>(null);
  const [generatedJD, setGeneratedJD] = useState<GeneratedJD | null>(null);

  // Editable JD State
  const [jdTitle, setJdTitle] = useState('');
  const [jdAbout, setJdAbout] = useState('');

  // Candidates & Matching State
  const [candidatesList, setCandidatesList] = useState<CandidateProfileData[]>([]);
  const [matchedResults, setMatchedResults] = useState<CandidateMatchResult[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);

  // Fetch candidates from Supabase or Fallback Mock Data
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const { data: projectsData } = await supabase.from('projects').select('*');
        const { data: profilesData } = await supabase.from('student_profiles').select('*');
        const { data: usersData } = await supabase.from('users').select('id, email, full_name');

        if (profilesData && profilesData.length > 0) {
          const userMap = new Map(usersData?.map(u => [u.id, u]) || []);
          const projectsByStudent = new Map<string, Array<{ title: string; is_verified?: boolean; verification_status?: string }>>();

          projectsData?.forEach((p: { student_id: string; title: string; is_verified?: boolean; verification_status?: string }) => {
            const list = projectsByStudent.get(p.student_id) || [];
            list.push(p);
            projectsByStudent.set(p.student_id, list);
          });

          const formatted: CandidateProfileData[] = profilesData.map(p => {
            const u = userMap.get(p.id);
            const pList = projectsByStudent.get(p.id) || [];
            return {
              id: p.id,
              full_name: p.full_name || u?.full_name || 'Ứng viên Sinh viên',
              university: p.university || 'Đại Học Bách Khoa',
              major: p.major || 'Công Nghệ Thông Tin',
              gpa: p.gpa || '3.6 / 4.0',
              email: u?.email || '',
              skills: p.skills || ['ReactJS', 'TypeScript', 'Tailwind', 'Git'],
              verified_projects_count: pList.filter(proj => proj.is_verified || proj.verification_status === 'verified').length,
              projects: pList.map(proj => ({
                title: proj.title,
                is_verified: proj.is_verified || proj.verification_status === 'verified'
              }))
            };
          });

          setCandidatesList(formatted);
        } else {
          setCandidatesList([]);
        }
      } catch (err) {
        console.error("Load candidates error:", err);
      }
    };

    loadCandidates();
  }, []);

  // Step 1 -> Step 2: Parse Prompt & Generate Brief + JD
  const handleAnalyzePrompt = () => {
    if (!promptText.trim()) {
      alert('Vui lòng nhập mô tả nhu cầu tuyển dụng của bạn!');
      return;
    }

    setAnalyzing(true);
    setTimeout(() => {
      const brief = parseHiringPrompt(promptText);
      const jd = generateJobDescription(brief);

      setHiringBrief(brief);
      setGeneratedJD(jd);
      setJdTitle(jd.title);
      setJdAbout(jd.aboutRole);

      setAnalyzing(false);
      setStep(2);
    }, 800);
  };

  // Step 2 -> Step 3: Run Candidate Matching
  const handleRunMatching = () => {
    if (!hiringBrief) return;
    setMatchingLoading(true);

    setTimeout(() => {
      const results = matchCandidatesWithJob(hiringBrief, candidatesList);
      setMatchedResults(results);
      setMatchingLoading(false);
      setStep(3);
    }, 600);
  };

  // Sample quick prompt selection
  const handleSelectSamplePrompt = (sample: string) => {
    setPromptText(sample);
  };

  return (
    <div style={{ padding: '30px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Title */}
        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8b5cf6', letterSpacing: '1px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#8b5cf6" /> AI RECRUITMENT ASSISTANT
            </div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', color: '#0f172a' }}>
              Trợ Lý Tuyển Dụng AI & Đề Xuất Ứng Viên Khớp Năng Lực
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Nhập nhu cầu tuyển dụng bằng ngôn ngữ tự nhiên ➔ AI phân tích ➔ Tạo JD ➔ Tự động khớp sinh viên có đồ án Verified.
            </p>
          </div>

          {/* Stepper Status */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'white', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}>
            <span style={{ color: step === 1 ? '#8b5cf6' : '#94a3b8' }}>1. Nhập nhu cầu</span>
            <span style={{ color: '#cbd5e1' }}>➔</span>
            <span style={{ color: step === 2 ? '#8b5cf6' : '#94a3b8' }}>2. Hiring Brief & JD</span>
            <span style={{ color: '#cbd5e1' }}>➔</span>
            <span style={{ color: step === 3 ? '#8b5cf6' : '#94a3b8' }}>3. Đề xuất ứng viên</span>
          </div>
        </div>

        {/* STEP 1: NATURAL LANGUAGE INPUT */}
        {step === 1 && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💬 Bạn đang tìm kiếm ứng viên vị trí nào?
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
              Mô tả vị trí, kỹ năng bắt buộc, địa điểm và số lượng đồ án thực tế bạn mong muốn ở ứng viên.
            </p>

            <textarea
              rows={4}
              value={promptText}
              onChange={e => setPromptText(e.target.value)}
              placeholder="VD: Tôi cần tuyển 1 thực tập sinh UI/UX biết sử dụng Figma, đã làm ít nhất 2 đồ án thực tế, có thể làm full-time tại TP. Hồ Chí Minh..."
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', lineHeight: '1.6', marginBottom: '20px' }}
            />

            {/* Quick Templates */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '10px' }}>⚡ Hoặc chọn nhanh mẫu nhu cầu tuyển dụng phổ biến:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  onClick={() => handleSelectSamplePrompt('Cần tuyển Thực tập sinh UI/UX Designer biết Figma, User Research, có 2 đồ án web/app thực tế, làm việc tại TP.HCM.')}
                  style={{ padding: '8px 14px', backgroundColor: '#f5f3ff', color: '#8b5cf6', border: '1px solid #ddd6fe', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🎨 UI/UX Intern (Figma, 2 Đồ án)
                </button>
                <button
                  onClick={() => handleSelectSamplePrompt('Tuyển Thực tập sinh Frontend ReactJS thạo TypeScript, Tailwind, có ít nhất 2 đồ án website thực tế, làm fulltime tại TP.HCM.')}
                  style={{ padding: '8px 14px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  💻 Frontend ReactJS Intern (TypeScript, 2 Đồ án)
                </button>
                <button
                  onClick={() => handleSelectSamplePrompt('Tuyển Thực tập sinh Backend Node.js biết SQL, Express, REST API, có 2 dự án cá nhân/môn học.')}
                  style={{ padding: '8px 14px', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ⚙️ Backend Node.js (Express, SQL)
                </button>
                <button
                  onClick={() => handleSelectSamplePrompt('Tuyển Thực tập sinh Data Analyst biết Python, SQL, Machine Learning, GPA từ 3.5 trở lên.')}
                  style={{ padding: '8px 14px', backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  📊 Data Analyst Intern (Python, SQL)
                </button>
              </div>
            </div>

            {/* Action Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleAnalyzePrompt}
                disabled={analyzing}
                style={{ padding: '12px 28px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)' }}
              >
                {analyzing ? '⏳ AI Đang Phân Tích Requirements...' : '⚡ AI Phân Tích & Tạo Hiring Brief →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: HIRING BRIEF & AI GENERATED JD */}
        {step === 2 && hiringBrief && generatedJD && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            
            {/* Column 1: AI Extracted Hiring Brief */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#1e3a8a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📋 AI Hiring Brief (Tiêu chí trích xuất)
                </h3>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit3 size={12} /> Sửa nhu cầu
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Vị trí tuyển dụng:</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginTop: '2px' }}>{hiringBrief.position}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Địa điểm:</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>📍 {hiringBrief.location}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Hình thức làm việc:</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>⏰ {hiringBrief.availability}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#047857', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>✓ Kỹ năng bắt buộc (MUST-HAVE):</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {hiringBrief.mustHaveSkills.map((sk, i) => (
                      <span key={i} style={{ fontSize: '12px', fontWeight: 'bold', backgroundColor: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>○ Kỹ năng khuyến khích (NICE-TO-HAVE):</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {hiringBrief.niceToHaveSkills.map((sk, i) => (
                      <span key={i} style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                        ○ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Yêu cầu đồ án thực tế:</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#8b5cf6', marginTop: '2px' }}>
                    🛡️ Tối thiểu {hiringBrief.minProjectsCount} đồ án (Ưu tiên đã qua kiểm định Giảng viên)
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: AI Generated Job Description (JD) */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📝 AI Generated Job Description (JD)
                  </h3>
                  <span style={{ fontSize: '11px', backgroundColor: '#f5f3ff', color: '#8b5cf6', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                    Có thể chỉnh sửa
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>Tên vị trí bài đăng *</label>
                    <input
                      type="text"
                      value={jdTitle}
                      onChange={e => setJdTitle(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 'bold', color: '#0f172a', boxSizing: 'border-box', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>Mô tả ngắn gọn về công việc</label>
                    <textarea
                      rows={3}
                      value={jdAbout}
                      onChange={e => setJdAbout(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', boxSizing: 'border-box', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>Trách nhiệm chính (AI đã sinh)</label>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                      {generatedJD.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Run Matching */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setStep(1)}
                  style={{ padding: '10px 18px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  Quay lại
                </button>
                <button
                  onClick={handleRunMatching}
                  disabled={matchingLoading}
                  style={{ padding: '10px 22px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {matchingLoading ? '⏳ Đang Quét & Khớp AI...' : '🚀 Khớp & Tìm Ứng Viên Phù Hợp →'}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: AI RECOMMENDED CANDIDATES & MATCH EXPLANATIONS */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                  🎯 Đã khớp thành công {matchedResults.length} sinh viên cho vị trí "{jdTitle}"
                </span>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Xếp hạng dựa trên % Match kỹ năng, số đồ án thực tế và kiểm định của Giảng viên.
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ← Chỉnh sửa Tiêu chí Hiring Brief
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {matchedResults.map(res => {
                const candData = candidatesList.find(c => c.id === res.candidateId);
                return (
                  <div key={res.candidateId} style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <div>
                      {/* Candidate Header & Match Score Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' }}>{res.candidateName}</h3>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            🎓 {candData?.university} • {candData?.major}
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: res.matchScore >= 80 ? '#047857' : '#1d4ed8' }}>
                            {res.matchScore}% Match
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>Độ tương thích AI</div>
                        </div>
                      </div>

                      {/* Progress Bar Score */}
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
                        <div style={{ width: `${res.matchScore}%`, height: '100%', backgroundColor: res.matchScore >= 80 ? '#10b981' : '#3b82f6' }} />
                      </div>

                      {/* Why this Candidate? Explanation */}
                      <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Why this candidate? (Lý do đề xuất):</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {res.whyText.map((why, i) => (
                            <div key={i} style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>
                              {why}
                            </div>
                          ))}
                          {res.warningText && (
                            <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '500', marginTop: '2px' }}>
                              {res.warningText}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            const localSaved = JSON.parse(localStorage.getItem(`saved_candidates_${user?.id || 'default'}`) || '[]');
                            const alreadySaved = localSaved.some((s: { student_id?: string }) => s.student_id === res.candidateId);
                            if (alreadySaved) {
                              alert(`Ứng viên ${res.candidateName} đã có trong danh sách Đã Lưu!`);
                            } else {
                              const newSaved = {
                                id: 'sc_' + Date.now(),
                                recruiter_id: user?.id || 'rec1',
                                student_id: res.candidateId,
                                folder_name: hiringBrief?.position || 'Ứng viên AI Match',
                                created_at: new Date().toISOString(),
                                student: { id: res.candidateId, full_name: res.candidateName, major: candData?.major, university: candData?.university, gpa: candData?.gpa, skills: candData?.skills }
                              };
                              localStorage.setItem(`saved_candidates_${user?.id || 'default'}`, JSON.stringify([...localSaved, newSaved]));
                              alert(`⭐ Đã lưu ứng viên ${res.candidateName} vào thư mục!`);
                            }
                          }}
                          style={{ flex: 1, padding: '8px', backgroundColor: '#f5f3ff', color: '#8b5cf6', border: '1px solid #ddd6fe', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Star size={14} /> Lưu Hồ Sơ
                        </button>

                        <button
                          onClick={() => {
                            const localPipeline = JSON.parse(localStorage.getItem(`pipeline_${user?.id || 'default'}`) || '[]');
                            const alreadyIn = localPipeline.some((p: { student_id?: string }) => p.student_id === res.candidateId);
                            if (alreadyIn) {
                              alert(`Ứng viên ${res.candidateName} đã có trong Pipeline!`);
                            } else {
                              const newItem = {
                                id: 'p_' + Date.now(),
                                recruiter_id: user?.id || 'rec1',
                                student_id: res.candidateId,
                                stage: 'shortlisted',
                                student: { id: res.candidateId, full_name: res.candidateName, major: candData?.major, university: candData?.university, gpa: candData?.gpa, skills: candData?.skills },
                                private_notes: `AI Match score ${res.matchScore}% cho vị trí ${hiringBrief?.position}`
                              };
                              localStorage.setItem(`pipeline_${user?.id || 'default'}`, JSON.stringify([...localPipeline, newItem]));
                              alert(`📊 Đã thêm ${res.candidateName} vào cột Shortlisted (Pipeline)!`);
                            }
                          }}
                          style={{ flex: 1, padding: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Kanban size={14} /> Shortlist Pipeline
                        </button>
                      </div>

                      <a
                        href={`mailto:${candData?.email}?subject=Mời%20Phỏng%20Vấn%20Vị%20Trí%20${encodeURIComponent(hiringBrief?.position || '')}&body=Chào%20${res.candidateName},%20hệ%20thống%20AI%20Profile%20Hub%20đã%20khớp%20hồ%20sơ%20verified%20của%20bạn%20với%20vị%20trí%20${encodeURIComponent(hiringBrief?.position || '')}...`}
                        style={{ padding: '10px', backgroundColor: '#1e3a8a', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Mail size={14} /> Mời Phỏng Vấn Trực Tiếp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

    </div>
  );
}
