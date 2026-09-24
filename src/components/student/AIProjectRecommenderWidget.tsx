import { useState, useEffect } from 'react';
import { Sparkles, Download, Target, Code, CheckSquare, Clock, Lightbulb, Check } from 'lucide-react';
import { generateAIProjectRecommendation, type AIProjectRecommendation } from '../../services/aiRecommendationService';
import { exportRecommendationToMarkdown, downloadMarkdownFile } from '../../utils/markdownExporter';

interface AIProjectRecommenderWidgetProps {
  studentId: string;
}

export default function AIProjectRecommenderWidget({ studentId }: AIProjectRecommenderWidgetProps) {
  const [recommendation, setRecommendation] = useState<AIProjectRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await generateAIProjectRecommendation(studentId);
        setRecommendation(data);
      } catch (err) {
        console.error('Error generating AI recommendation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentId]);

  const handleDownloadSpec = () => {
    if (!recommendation) return;
    const mdContent = exportRecommendationToMarkdown(recommendation);
    const slug = recommendation.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    downloadMarkdownFile(`README-spec-${slug}.md`, mdContent);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', textAlign: 'center', color: '#64748b' }}>
        <Sparkles size={24} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>AI đang phân tích Recruiter Feedback & Tổng hợp Gợi ý Đồ án Khắc phục Điểm yếu...</p>
      </div>
    );
  }

  if (!recommendation) return null;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #c084fc', padding: '24px', boxShadow: '0 10px 30px -10px rgba(168, 85, 247, 0.15)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Top Banner Accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #a855f7, #ec4899, #3b82f6)' }} />

      {/* Widget Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>AI Gợi Ý Đồ Án Khắc Phục Lỗ Hổng Kiến Thức</h3>
              <span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', border: '1px solid #e9d5ff' }}>PERSONALIZED</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Phân tích trực tiếp từ Phản hồi Phỏng vấn của Nhà tuyển dụng</p>
          </div>
        </div>

        <button 
          onClick={handleDownloadSpec}
          style={{ backgroundColor: '#9333ea', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(147, 51, 234, 0.25)', transition: 'all 0.2s' }}
        >
          {downloaded ? <Check size={16} /> : <Download size={16} />}
          {downloaded ? 'Đã Tải File Spec (.md)!' : '📥 Tải File Spec (.md)'}
        </button>
      </div>

      {/* Target Blind Spot Badge */}
      <div style={{ backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Target size={20} color="#db2777" />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#9d174d', textTransform: 'uppercase' }}>Điểm Mù Cần Khắc Phục:</span>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#831843' }}>{recommendation.target_blind_spot}</div>
        </div>
      </div>

      {/* Project Title & Overview */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '6px' }}>
            Độ khó: {recommendation.difficulty}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
            <Clock size={14} /> Thời gian: {recommendation.estimated_duration}
          </span>
        </div>

        <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 10px', lineHeight: '1.4' }}>
          {recommendation.title}
        </h4>

        {/* Rationale Quote */}
        <div style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #a855f7', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: '13px', color: '#475569', fontStyle: 'italic', lineHeight: '1.5' }}>
          <Lightbulb size={16} color="#9333ea" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          "{recommendation.rationale}"
        </div>
      </div>

      {/* Tech Stack */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code size={14} /> Công Nghệ Khuyên Dùng (Tech Stack):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {recommendation.recommended_tech_stack.map(tech => (
            <span key={tech} style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px', border: '1px solid #d8b4fe' }}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Feature Backlog Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', backgroundColor: '#faf5ff', padding: '16px', borderRadius: '12px', border: '1px solid #f3e8ff' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#581c87', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckSquare size={16} /> Tính Năng Cần Thực Hiện:
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#4c1d95', lineHeight: '1.6' }}>
            {recommendation.feature_backlog.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#15803d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🎯 Tiêu Chí Hoàn Thành (Definition of Done):
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#166534', lineHeight: '1.6' }}>
            {recommendation.definition_of_done.map((dod, idx) => (
              <li key={idx}>{dod}</li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}
