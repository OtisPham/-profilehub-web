import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { Sparkles, MessageSquare, CheckCircle2, Award, RotateCcw, Lightbulb, Send, ShieldCheck, Briefcase, Zap, AlertTriangle, BarChart3, BookOpen, Star, Building } from 'lucide-react';
import { fetchVerifiedProjects, fetchRecruiterJobs, generateTailoredQuestions, evaluateStudentAnswer, type TailoredQuestion, type AIEvaluationResult } from '../../services/aiInterviewService';
import { fetchStudentFeedbacks, analyzeStudentBlindSpots, type BlindSpotAnalysis } from '../../services/feedbackService';
import type { Project, JobPost, InterviewFeedback } from '../../types/database';
import AIProjectRecommenderWidget from '../../components/student/AIProjectRecommenderWidget';


interface QuestionItem {
  id: string;
  category: string;
  question: string;
  sampleAnswer: string;
  keyPoints: string[];
}

export default function AIInterviewPrep() {
  const { user } = useAuth();

  // Mode Selection: 'standard' | 'ai_tailored' | 'blind_spot'
  const [activeMode, setActiveMode] = useState<'standard' | 'ai_tailored' | 'blind_spot'>('standard');

  // Mode 1: Standard Question Bank State
  const [selectedRole, setSelectedRole] = useState<'frontend' | 'uiux' | 'backend' | 'data'>('frontend');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, string>>({});
  const [showSample, setShowSample] = useState(false);
  const [completedSession, setCompletedSession] = useState(false);

  // Mode 2: AI Tailored State
  const [verifiedProjects, setVerifiedProjects] = useState<Project[]>([]);
  const [recruiterJobs, setRecruiterJobs] = useState<JobPost[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [tailoredQuestions, setTailoredQuestions] = useState<TailoredQuestion[]>([]);
  const [tailoredIndex, setTailoredIndex] = useState(0);
  const [tailoredAnswer, setTailoredAnswer] = useState('');
  const [aiEvalResult, setAiEvalResult] = useState<AIEvaluationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedTailoredSession, setCompletedTailoredSession] = useState(false);

  // Mode 3: Recruiter Feedback Loop & AI Blind Spot State
  const [feedbacks, setFeedbacks] = useState<InterviewFeedback[]>([]);
  const [blindSpotReport, setBlindSpotReport] = useState<BlindSpotAnalysis | null>(null);

  // Standard Question Banks (Phase 1 Data)
  const questionBanks: Record<string, QuestionItem[]> = {
    frontend: [
      {
        id: 'fe-1',
        category: 'Kỹ Thuật Core',
        question: 'Bạn hãy giải thích sự khác biệt giữa Virtual DOM và Real DOM trong ReactJS? Khi nào React re-render?',
        sampleAnswer: 'Virtual DOM là một bản sao nhẹ nằm trong bộ nhớ của Real DOM. Khi state thay đổi, React tạo ra một Virtual DOM tree mới, so sánh (Diffing Algorithm) với bản cũ và chỉ cập nhật những phần thay đổi thực sự lên Real DOM (Reconciliation), giúp tối ưu hiệu năng.',
        keyPoints: ['Khái niệm Virtual DOM & Memory', 'Thuật toán Diffing Algorithm', 'Khái niệm Reconciliation', 'Cách React tránh render không cần thiết (React.memo, useMemo)']
      },
      {
        id: 'fe-2',
        category: 'Tối Ưu Hiệu Năng',
        question: 'Làm thế nào để bạn tối ưu tốc độ tải trang (Page Load Speed) cho ứng dụng React/Web?',
        sampleAnswer: 'Tôi tối ưu bằng cách áp dụng Code Splitting (React.lazy/Suspense), nén & lazy load hình ảnh, tối ưu bundle size, tận dụng browser caching, và hạn chế re-render thừa bằng useMemo/useCallback.',
        keyPoints: ['Code Splitting & Lazy loading', 'Image Optimization', 'Bundle analysis', 'Memoization']
      },
      {
        id: 'fe-3',
        category: 'Quản Lý Trạng Thái',
        question: 'Khi nào bạn nên dùng Redux/Zustand thay vì React Context API?',
        sampleAnswer: 'React Context phù hợp cho dữ liệu ít thay đổi như Theme, Auth state. Khi ứng dụng có state phức tạp, tần suất cập nhật cao và cần devtools debug nhiều component độc lập, Zustand/Redux sẽ hiệu quả hơn để tránh re-render toàn bộ provider.',
        keyPoints: ['Tần suất re-render của Context', 'State phức tạp & Async actions', 'Redux DevTools debugging']
      }
    ],
    uiux: [
      {
        id: 'ux-1',
        category: 'Quy Trình Thiết Kế',
        question: 'Bạn áp dụng quy trình Design Thinking như thế nào khi bắt đầu một dự án mới?',
        sampleAnswer: 'Tôi tuân theo 5 bước: Empathize (Thấu hiểu người dùng qua phỏng vấn/survey), Define (Xác định đúng bài toán), Ideate (Sáng tạo giải pháp), Prototype (Tạo bản vẽ wireframe/Figma) và Test (Thử nghiệm với người dùng thật).',
        keyPoints: ['5 bước Design Thinking', 'User Research methodology', 'Iterative Prototyping']
      },
      {
        id: 'ux-2',
        category: 'Design System',
        question: 'Làm thế nào bạn xây dựng và duy trì một Design System đồng bộ cho đội ngũ phát triển?',
        sampleAnswer: 'Tôi xây dựng bộ Color Tokens, Typography, Spacing Grid và Reusable Components trên Figma, đóng gói theo chuẩn DESIGN.md và phối hợp chặt chẽ với Frontend Dev để đồng bộ component library.',
        keyPoints: ['Design Tokens', 'Reusable Components', 'Đồng bộ Figma với Code']
      }
    ],
    backend: [
      {
        id: 'be-1',
        category: 'Cơ Sở Dữ Liệu',
        question: 'Bạn xử lý bài toán N+1 Query trong ORM/Database như thế nào?',
        sampleAnswer: 'Lỗi N+1 xảy ra khi truy vấn dữ liệu quan hệ trong vòng lặp. Tôi khắc phục bằng cách áp dụng Eager Loading (JOIN / include) hoặc Dataloader để gộp truy vấn thành 1 câu SQL duy nhất.',
        keyPoints: ['Nguyên nhân N+1 query', 'Eager Loading vs Lazy Loading', 'JOIN / Dataloader']
      },
      {
        id: 'be-2',
        category: 'Bảo Mật API',
        question: 'Làm sao để bảo mật các API Endpoints chống lại tấn công SQL Injection và XSS?',
        sampleAnswer: 'Dùng Parameterized Queries / ORM để chống SQL Injection, Validate & Sanitize toàn bộ input đầu vào, và cài đặt JWT Token cùng CORS policy cho API.',
        keyPoints: ['Parameterized Query', 'Input Sanitization', 'JWT Authentication & CORS']
      }
    ],
    data: [
      {
        id: 'da-1',
        category: 'Phân Tích Dữ Liệu',
        question: 'Khi dữ liệu đầu vào bị thiếu (Missing Values), bạn xử lý như thế nào?',
        sampleAnswer: 'Tùy thuộc tỷ lệ thiếu: nếu ít có thể điền bằng Mean/Median/Mode hoặc dùng mô hình KNN Imputer. Nếu thiếu quá nhiều (>50%) có thể xem xét loại bỏ biến hoặc tạo biến cờ báo thiếu.',
        keyPoints: ['Imputation techniques (Mean/Median)', 'KNN Imputer', 'Đánh giá tỷ lệ mất dữ liệu']
      }
    ]
  };

  // Load Verified Projects, Recruiter JDs, and Recruiter Feedbacks on mount
  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        const projects = await fetchVerifiedProjects(user.id);
        setVerifiedProjects(projects);
        if (projects.length > 0) setSelectedProjectId(projects[0].id);

        const fbs = await fetchStudentFeedbacks(user.id);
        setFeedbacks(fbs);
        setBlindSpotReport(analyzeStudentBlindSpots(fbs));
      }
      const jobs = await fetchRecruiterJobs();
      setRecruiterJobs(jobs);
      if (jobs.length > 0) setSelectedJobId(jobs[0].id);
    };
    loadData();
  }, [user?.id]);

  // Handle generating AI Tailored Questions
  const handleGenerateTailored = () => {
    setIsGenerating(true);
    const targetProject = verifiedProjects.find(p => p.id === selectedProjectId) || verifiedProjects[0];
    const targetJob = recruiterJobs.find(j => j.id === selectedJobId) || recruiterJobs[0];

    const questions = generateTailoredQuestions(targetProject, targetJob);
    setTailoredQuestions(questions);
    setTailoredIndex(0);
    setTailoredAnswer('');
    setAiEvalResult(null);
    setCompletedTailoredSession(false);
    setIsGenerating(false);
  };

  const handleNextTailored = () => {
    if (tailoredIndex < tailoredQuestions.length - 1) {
      setTailoredIndex(tailoredIndex + 1);
      setTailoredAnswer('');
      setAiEvalResult(null);
    } else {
      setCompletedTailoredSession(true);
    }
  };

  const handleEvaluateAnswer = () => {
    if (!tailoredQuestions[tailoredIndex]) return;
    const result = evaluateStudentAnswer(tailoredQuestions[tailoredIndex], tailoredAnswer);
    setAiEvalResult(result);
  };

  // Standard Mode Handlers
  const currentQuestions = questionBanks[selectedRole] || questionBanks.frontend;
  const currentQ = currentQuestions[currentIndex] || currentQuestions[0];

  const handleNext = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer(submittedAnswers[currentQuestions[currentIndex + 1]?.id] || '');
      setShowSample(false);
    } else {
      setCompletedSession(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserAnswer(submittedAnswers[currentQuestions[currentIndex - 1]?.id] || '');
      setShowSample(false);
    }
  };

  const handleSaveAnswer = () => {
    setSubmittedAnswers(prev => ({
      ...prev,
      [currentQ.id]: userAnswer
    }));
    setShowSample(true);
  };

  const handleResetSession = () => {
    setCompletedSession(false);
    setCurrentIndex(0);
    setUserAnswer('');
    setSubmittedAnswers({});
    setShowSample(false);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1050px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#3b82f6', letterSpacing: '1px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#3b82f6" /> AI INTERVIEW PREPARATION & FEEDBACK LOOP
          </div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', color: '#0f172a' }}>
            Luyện Tập Phỏng Vấn & Phân Tích Điểm Mù AI
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Luyện tập phỏng vấn chuẩn, sinh câu hỏi cá nhân hóa từ Đồ án Verified & nhận Báo cáo Điểm mù kiến thức từ Nhà tuyển dụng.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/mock-interview"
            style={{ fontSize: '12px', fontWeight: 'bold', color: '#6366f1', backgroundColor: '#eef2ff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #c7d2fe', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📜 Xem Lịch Sử Phỏng Vấn AI
          </Link>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', backgroundColor: '#eff6ff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #bfdbfe' }}>
            👨‍🎓 {user?.email}
          </span>
        </div>
      </div>

      {/* Main Mode Toggle: 3 Modes */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveMode('standard')}
          style={{
            flex: 1,
            padding: '14px 16px',
            borderRadius: '10px',
            border: activeMode === 'standard' ? '2px solid #1e3a8a' : '1px solid #cbd5e1',
            backgroundColor: activeMode === 'standard' ? '#eff6ff' : 'white',
            color: activeMode === 'standard' ? '#1e3a8a' : '#475569',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: activeMode === 'standard' ? '0 2px 8px rgba(30, 58, 138, 0.15)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          📚 Câu Hỏi Chuẩn Theo Ngành
        </button>

        <button
          onClick={() => {
            setActiveMode('ai_tailored');
            if (tailoredQuestions.length === 0) {
              handleGenerateTailored();
            }
          }}
          style={{
            flex: 1,
            padding: '14px 16px',
            borderRadius: '10px',
            border: activeMode === 'ai_tailored' ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
            backgroundColor: activeMode === 'ai_tailored' ? '#f5f3ff' : 'white',
            color: activeMode === 'ai_tailored' ? '#6d28d9' : '#475569',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: activeMode === 'ai_tailored' ? '0 2px 8px rgba(139, 92, 246, 0.15)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Zap size={16} color="#8b5cf6" /> 🎯 AI Sinh Câu Hỏi Theo Đồ Án & JD
        </button>

        <button
          onClick={() => setActiveMode('blind_spot')}
          style={{
            flex: 1,
            padding: '14px 16px',
            borderRadius: '10px',
            border: activeMode === 'blind_spot' ? '2px solid #059669' : '1px solid #cbd5e1',
            backgroundColor: activeMode === 'blind_spot' ? '#ecfdf5' : 'white',
            color: activeMode === 'blind_spot' ? '#047857' : '#475569',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: activeMode === 'blind_spot' ? '0 2px 8px rgba(5, 150, 105, 0.15)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <BarChart3 size={16} color="#059669" /> 📊 Báo Cáo Điểm Mù AI & Feedback Loop
        </button>
      </div>

      {/* MODE 1: STANDARD QUESTION BANK */}
      {activeMode === 'standard' && (
        <>
          {/* Role Selector Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', backgroundColor: 'white', padding: '8px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {[
              { id: 'frontend', label: '💻 Frontend Developer' },
              { id: 'uiux', label: '🎨 UI/UX Designer' },
              { id: 'backend', label: '⚙️ Backend Developer' },
              { id: 'data', label: '📊 Data Analyst' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedRole(tab.id as 'frontend' | 'uiux' | 'backend' | 'data');
                  setCurrentIndex(0);
                  setUserAnswer('');
                  setShowSample(false);
                  setCompletedSession(false);
                }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: selectedRole === tab.id ? '#1e3a8a' : 'transparent',
                  color: selectedRole === tab.id ? 'white' : '#475569',
                  fontWeight: selectedRole === tab.id ? 'bold' : 'normal',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {!completedSession ? (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              
              {/* Question Counter Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '6px' }}>
                  {currentQ.category}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                  Câu hỏi {currentIndex + 1} / {currentQuestions.length}
                </span>
              </div>

              {/* Question Content */}
              <h2 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px', lineHeight: '1.5' }}>
                {currentQ.question}
              </h2>

              {/* Answer Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={16} /> Câu trả lời của bạn:
                </label>
                <textarea
                  rows={5}
                  placeholder="Nhập câu trả lời của bạn tại đây..."
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', lineHeight: '1.5' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  style={{ padding: '10px 18px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.5 : 1, fontWeight: 'bold', fontSize: '13px', color: '#475569' }}
                >
                  ← Câu trước
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleSaveAnswer}
                    style={{ padding: '10px 18px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={15} /> Kiểm tra & Xem gợi ý đáp án
                  </button>
                  <button
                    onClick={handleNext}
                    style={{ padding: '10px 20px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {currentIndex === currentQuestions.length - 1 ? 'Hoàn thành phiên' : 'Câu tiếp theo →'}
                  </button>
                </div>
              </div>

              {/* AI Sample Answer & Key Points Section */}
              {showSample && (
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', marginTop: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#059669', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lightbulb size={18} /> Gợi Ý Đáp Án Mẫu & Điểm Trọng Tâm Từ AI:
                  </div>
                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', marginBottom: '15px', backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    {currentQ.sampleAnswer}
                  </p>

                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>📌 Các Ý Chính Cần Có Trong Câu Trả Lời:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentQ.keyPoints.map((point, idx) => (
                      <span key={idx} style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Completion Screen */
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto' }}>
                <Award size={32} />
              </div>
              <h2 style={{ fontSize: '22px', color: '#0f172a', margin: '0 0 10px 0' }}>Hoàn Thành Phiên Luyện Tập Phỏng Vấn!</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>
                Bạn đã hoàn thành toàn bộ {currentQuestions.length} câu hỏi phỏng vấn vị trí <strong>{selectedRole.toUpperCase()}</strong>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button
                  onClick={handleResetSession}
                  style={{ padding: '12px 24px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <RotateCcw size={16} /> Luyện Tập Lại Phiên Này
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODE 2: AI TAILORED QUESTIONS (VERIFIED PROJECTS + RECRUITER JD) */}
      {activeMode === 'ai_tailored' && (
        <div>
          {/* Selector Panel */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#8b5cf6" /> Cấu Hình Sinh Câu Hỏi AI Từ Đồ Án Verified & JD
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* Select Verified Project */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#059669" /> Select Verified Project của Sinh Viên:
                </label>
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#f8fafc' }}
                >
                  {verifiedProjects.map(proj => (
                    <option key={proj.id} value={proj.id}>
                      🛡️ {proj.title} ({proj.tags?.join(', ') || 'Chưa gắn tag'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Recruiter JD */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={16} color="#8b5cf6" /> Select Tin Tuyển Dụng (JD Target):
                </label>
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#f8fafc' }}
                >
                  {recruiterJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      🏢 {job.title} - {job.location || 'TP. Hồ Chí Minh'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateTailored}
              disabled={isGenerating}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.25)'
              }}
            >
              <Sparkles size={18} /> {isGenerating ? 'AI Đang Bóc Tách & Sinh Câu Hỏi...' : '🤖 Sinh Câu Hỏi Phỏng Vấn Sát Đồ Án Real-Time'}
            </button>
          </div>

          {/* Tailored Questions Workspace */}
          {tailoredQuestions.length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              
              {/* Question Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6d28d9', backgroundColor: '#f5f3ff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #ddd6fe' }}>
                  {tailoredQuestions[tailoredIndex]?.category}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                  Câu hỏi cá nhân hóa {tailoredIndex + 1} / {tailoredQuestions.length}
                </span>
              </div>

              {/* Dynamic Question Text */}
              <h2 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px', lineHeight: '1.5' }}>
                {tailoredQuestions[tailoredIndex]?.question}
              </h2>

              {/* Student Answer Textarea */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={16} /> Nhập câu trả lời của bạn:
                </label>
                <textarea
                  rows={6}
                  placeholder="Trình bày giải pháp kỹ thuật, kiến trúc và kết quả đạt được từ đồ án của bạn..."
                  value={tailoredAnswer}
                  onChange={e => setTailoredAnswer(e.target.value)}
                  style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', lineHeight: '1.5' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <button
                  onClick={() => {
                    if (tailoredIndex > 0) {
                      setTailoredIndex(tailoredIndex - 1);
                      setTailoredAnswer('');
                      setAiEvalResult(null);
                    }
                  }}
                  disabled={tailoredIndex === 0}
                  style={{ padding: '10px 18px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: tailoredIndex === 0 ? 'not-allowed' : 'pointer', opacity: tailoredIndex === 0 ? 0.5 : 1, fontWeight: 'bold', fontSize: '13px', color: '#475569' }}
                >
                  ← Câu trước
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleEvaluateAnswer}
                    style={{ padding: '10px 18px', backgroundColor: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Zap size={15} color="#8b5cf6" /> 🤖 AI Chấm Điểm & Phân Tích Instant
                  </button>
                  <button
                    onClick={handleNextTailored}
                    style={{ padding: '10px 20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    {tailoredIndex === tailoredQuestions.length - 1 ? 'Hoàn thành phiên ✓' : 'Câu tiếp theo →'}
                  </button>
                </div>
              </div>

              {/* Instant AI Evaluation Result */}
              {aiEvalResult && (
                <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '24px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={20} color="#8b5cf6" /> Kết Quả Đánh Giá AI Instant
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#581c87', backgroundColor: '#f3e8ff', padding: '4px 12px', borderRadius: '12px' }}>
                        Xếp loại: {aiEvalResult.grade}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#6d28d9', backgroundColor: 'white', border: '1px solid #ddd6fe', padding: '4px 14px', borderRadius: '12px' }}>
                        Score: {aiEvalResult.score} / 100
                      </span>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#047857', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} /> Điểm Mạnh Trong Câu Trả Lời:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#15803d', lineHeight: '1.6' }}>
                      {aiEvalResult.strengths.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#b45309', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={16} /> Góp Ý Cải Thiện & Điểm Thiếu Sót:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#b45309', lineHeight: '1.6' }}>
                      {aiEvalResult.improvements.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Sample Answer */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#4338ca', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lightbulb size={16} /> Đáp Án Mẫu Chuẩn Cho Tình Huống Này:
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e9d5ff', lineHeight: '1.6' }}>
                      {aiEvalResult.sampleAnswer}
                    </p>
                  </div>

                </div>
              )}

              {/* Completion Screen when Tailored Session Finished */}
              {completedTailoredSession && (
                <div style={{ backgroundColor: '#faf5ff', borderRadius: '12px', border: '2px solid #c084fc', padding: '30px', textAlign: 'center', marginTop: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f3e8ff', color: '#8b5cf6', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px auto' }}>
                    <Award size={30} />
                  </div>
                  <h3 style={{ fontSize: '20px', color: '#581c87', margin: '0 0 8px 0', fontWeight: 'bold' }}>🎉 Hoàn Thành Bài Luyện Tập AI Cá Nhân Hóa!</h3>
                  <p style={{ color: '#6b21a8', fontSize: '13px', marginBottom: '20px' }}>
                    Bạn đã xuất sắc trả lời toàn bộ {tailoredQuestions.length} câu hỏi phỏng vấn được bóc tách từ Đồ án Verified & JD Tuyển dụng.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        setCompletedTailoredSession(false);
                        setTailoredIndex(0);
                        setTailoredAnswer('');
                        setAiEvalResult(null);
                      }}
                      style={{ padding: '10px 20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RotateCcw size={15} /> Luyện Tập Lại Phiên Này
                    </button>
                    <Link
                      to="/mock-interview"
                      style={{ padding: '10px 20px', backgroundColor: '#ffffff', color: '#6d28d9', border: '1px solid #c084fc', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      📜 Xem Lịch Sử Phỏng Vấn AI
                    </Link>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* MODE 3: RECRUITER FEEDBACK LOOP & AI BLIND SPOT ANALYSIS */}
      {activeMode === 'blind_spot' && (
        <div>
          {/* AI Project Recommendation & Markdown Spec Exporter Widget */}
          <div style={{ marginBottom: '25px' }}>
            <AIProjectRecommenderWidget studentId={user?.id || 'std-default'} />
          </div>

          {/* Top Score Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '25px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={16} color="#eab308" /> ĐIỂM KỸ THUẬT TRUNG BÌNH
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>
                {blindSpotReport?.averageTechScore || '8.0'}<span style={{ fontSize: '14px', color: '#64748b' }}> / 10</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} color="#3b82f6" /> ĐIỂM KỸ NĂNG MỀM TRUNG BÌNH
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>
                {blindSpotReport?.averageSoftScore || '8.5'}<span style={{ fontSize: '14px', color: '#64748b' }}> / 10</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#059669" /> XẾP LOẠI TỔNG THỂ AI
              </div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#047857', marginTop: '4px' }}>
                🛡️ {blindSpotReport?.overallGrade || 'Tốt'}
              </div>
            </div>
          </div>

          {/* AI Remedial Action Plan & Knowledge Blind Spots */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px', marginBottom: '25px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="#dc2626" /> Báo Cáo Điểm Mù Kiến Thức & Lộ Trình Đồ Án Khắc Phục
            </h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              Hệ thống AI tự động tổng hợp lỗ hổng kỹ năng được nhận xét bởi các Nhà tuyển dụng và đề xuất lộ trình tự học + đồ án thực chiến.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {blindSpotReport?.remedialRecommendations.map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#9f1239', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} /> Điểm mù #{idx + 1}: {item.spot}
                  </div>
                  
                  <div style={{ fontSize: '13px', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <BookOpen size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div><strong>Lộ trình học khắc phục:</strong> {item.actionPlan}</div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#15803d', display: 'flex', alignItems: 'flex-start', gap: '6px', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    <Zap size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div><strong>Đồ án bổ trợ đề xuất:</strong> {item.recommendedProject}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter Interview Feedback Cards */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color="#8b5cf6" /> Lịch Sử Đánh Giá Phỏng Vấn Thực Tế Từ Nhà Tuyển Dụng
            </h3>

            {feedbacks.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>Chưa có đánh giá phỏng vấn nào.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {feedbacks.map(fb => (
                  <div key={fb.id} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>
                          🏢 {fb.company_name || 'Doanh Nghiệp Tuyển Dụng'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          👨‍💼 Người phỏng vấn: {fb.recruiter_name || 'HR Team'} • {new Date(fb.created_at || '').toLocaleDateString('vi-VN')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#8b5cf6', backgroundColor: '#f5f3ff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #ddd6fe' }}>
                          Kỹ thuật: {fb.technical_score}/10
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                          Kỹ năng mềm: {fb.soft_skills_score}/10
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5', margin: '0 0 10px 0', backgroundColor: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      "{fb.recruiter_comment}"
                    </p>

                    {fb.blind_spots && fb.blind_spots.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#dc2626' }}>📌 Điểm còn yếu:</span>
                        {fb.blind_spots.map((spot, i) => (
                          <span key={i} style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                            {spot}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
