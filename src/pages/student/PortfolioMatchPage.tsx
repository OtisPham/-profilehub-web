import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Lightbulb, 
  Briefcase, 
  FileText, 
  Zap,
  TrendingUp,
  ShieldCheck,
  Code2,
  ChevronRight,
} from 'lucide-react';
import { PRESET_JOB_ROLES, analyzePortfolioMatch } from '../../services/portfolioMatchService';
import type { PortfolioMatchResult } from '../../types/portfolioMatch';

export const PortfolioMatchPage: React.FC = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('frontend-react');
  const [jdText, setJdText] = useState<string>(PRESET_JOB_ROLES[0].defaultJd);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<PortfolioMatchResult | null>(null);

  // Student profile dataset
  const sampleUserSkills = ['ReactJS', 'TypeScript', 'TailwindCSS', 'JavaScript', 'REST API', 'Git', 'HTML/CSS'];
  const sampleProjects = [
    {
      id: 'p1',
      title: 'Hệ thống Quản lý Portfolio & Xác thực Đồ án (ProfileHub)',
      description: 'Xây dựng với ReactJS, TypeScript, TailwindCSS và Supabase. Tích hợp AI CV Builder & Phân tích tự động.',
      tags: ['ReactJS', 'TypeScript', 'TailwindCSS', 'Supabase', 'REST API'],
      is_verified: true
    },
    {
      id: 'p2',
      title: 'E-Commerce Storefront với Redux Toolkit',
      description: 'Trang web bán hàng thời trang có giỏ hàng, thanh toán Stripe và quản lý sản phẩm.',
      tags: ['ReactJS', 'JavaScript', 'Redux', 'REST API', 'TailwindCSS'],
      is_verified: false
    }
  ];
  const sampleCertificates = [
    { id: 'c1', title: 'Meta Front-End Developer Professional Certificate', issuer: 'Coursera / Meta' },
    { id: 'c2', title: 'FreeCodeCamp Responsive Web Design', issuer: 'FreeCodeCamp' }
  ];

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    const role = PRESET_JOB_ROLES.find(r => r.id === roleId);
    if (role) {
      setJdText(role.defaultJd);
    }
  };

  const handleRunAnalysis = async () => {
    if (!jdText.trim()) return;
    setIsAnalyzing(true);
    try {
      await new Promise(res => setTimeout(res, 500));
      const result = await analyzePortfolioMatch(
        jdText,
        sampleUserSkills,
        sampleProjects,
        sampleCertificates
      );
      setAnalysisResult(result);
    } catch (err) {
      console.error('Lỗi khi phân tích portfolio:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0b0f17] text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Hero Section */}
        <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" /> PROFILEHUB MATCH ENGINE v2.0
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-4">
              Đánh Giá Tương Thích & Lỗ Hổng Portfolio vs JD
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              So sánh tự động Đồ án, Kỹ năng và Chứng chỉ của bạn với Yêu cầu tuyển dụng (JD). 
              Xác định điểm mạnh, khoanh vùng kỹ năng còn thiếu và nhận đề xuất nâng cấp đồ án thực tế.
            </p>
          </div>
        </div>

        {/* Input & Control Panel */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>1. Chọn Vị Trí Mục Tiêu Hoặc Dán JD</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">Tự động trích xuất Tech Stack & Keyword</span>
          </div>

          {/* Job Role Selector Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRESET_JOB_ROLES.map(role => {
              const isSelected = selectedRoleId === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role.id)}
                  className={`group relative p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/80 text-white shadow-lg shadow-blue-500/5'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors mb-1 line-clamp-1">
                    {role.title}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">{role.category}</div>
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* JD Input Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" /> Nội dung Mô tả công việc (JD Text):
              </label>
              <span className="text-[11px] text-slate-500">Chỉnh sửa tự do hoặc dán nội dung JD từ bất kỳ nguồn nào</span>
            </div>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={6}
              placeholder="Dán nội dung Mô tả công việc (JD) vào đây..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:border-blue-500/80 transition-colors font-mono leading-relaxed"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !jdText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AI Đang Phân Tích Portfolio...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Chạy Phân Tích Tương Thích Portfolio</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Analysis Results View */}
        {analysisResult && (
          <div className="space-y-6">
            
            {/* Score & Executive Summary Hero Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                {/* Score Gauge Ring */}
                <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-950 border-4 border-blue-500/80 shadow-2xl">
                  <div className="text-center">
                    <span className="text-4xl font-extrabold text-white tracking-tight">{analysisResult.overallScore}%</span>
                    <span className="block text-[10px] uppercase font-mono font-bold text-slate-400 tracking-widest mt-0.5">Score</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full border ${
                      analysisResult.overallScore >= 80 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : analysisResult.overallScore >= 65 
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {analysisResult.matchRating.toUpperCase()} MATCH
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> AI Score Verified
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Đánh Giá Tổng Quan Từ AI Engine</h3>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                    {analysisResult.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Grid: Skills & Project Relevance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Skill Match Bento */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-5">
                    <Target className="w-5 h-5 text-blue-400" />
                    Bản Đồ Kỹ Năng (Skill Coverage Map)
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Kỹ năng sở hữu phù hợp ({analysisResult.matchedSkills.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.matchedSkills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono font-semibold">
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" /> Lỗ hổng kỹ năng cần bổ sung ({analysisResult.missingSkills.length})
                        </span>
                      </div>
                      {analysisResult.missingSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.missingSkills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-mono font-semibold">
                              ! {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-mono">Bạn đã phủ kín 100% các kỹ năng yêu cầu trong JD này!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Relevance Ranking Bento */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  Mức Độ Phù Hợp Của Đồ Án Hiện Có
                </h3>

                <div className="space-y-3">
                  {analysisResult.projectMatches.map((proj) => (
                    <div key={proj.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between gap-4 transition-all hover:border-slate-700">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <h4 className="text-sm font-bold text-slate-100">{proj.title}</h4>
                          {proj.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <ShieldCheck className="w-3 h-3" /> VERIFIED
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.matchedSkills.map((s, idx) => (
                            <span key={idx} className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-extrabold text-blue-400 font-mono">{proj.relevanceScore}%</span>
                        <span className="block text-[10px] font-mono text-slate-500">Relevance</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Recommended Project Idea Callout */}
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-300" /> AI Recommended Roadmap Project
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  {analysisResult.recommendedProjectIdea.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-5 max-w-3xl">
                  {analysisResult.recommendedProjectIdea.description}
                </p>

                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono text-slate-500 block mb-1.5">Stack công nghệ cần triển khai:</span>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.recommendedProjectIdea.keyTechStack.map((tech, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable Optimization Checklist */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Khuyến Nghị Tối Ưu Portfolio & Hồ Sơ Đội Ngũ Tuyển Dụng
              </h3>
              <div className="space-y-3">
                {analysisResult.optimizationTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-slate-300 bg-slate-950/50 border border-slate-800/60 rounded-xl p-4">
                    <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default PortfolioMatchPage;
