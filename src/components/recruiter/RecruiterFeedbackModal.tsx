import { useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { saveInterviewFeedback } from '../../services/feedbackService';
import { X, Star, MessageSquare, AlertCircle, Award } from 'lucide-react';

interface RecruiterFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    full_name?: string;
    major?: string;
  };
  onSuccess?: () => void;
}

export default function RecruiterFeedbackModal({ isOpen, onClose, candidate, onSuccess }: RecruiterFeedbackModalProps) {
  const { user } = useAuth();
  const [techScore, setTechScore] = useState<number>(8);
  const [softScore, setSoftScore] = useState<number>(8);
  const [comment, setComment] = useState('');
  const [blindSpotInput, setBlindSpotInput] = useState('');
  const [blindSpots, setBlindSpots] = useState<string[]>(['Tối ưu SQL Indexing', 'Async Error Handling']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddBlindSpot = () => {
    if (blindSpotInput.trim() && !blindSpots.includes(blindSpotInput.trim())) {
      setBlindSpots([...blindSpots, blindSpotInput.trim()]);
      setBlindSpotInput('');
    }
  };

  const handleRemoveBlindSpot = (spotToRemove: string) => {
    setBlindSpots(blindSpots.filter(s => s !== spotToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Vui lòng nhập nhận xét phỏng vấn.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveInterviewFeedback({
        recruiter_id: user?.id || 'rec-default',
        recruiter_name: (user as any)?.full_name 
          ? `${(user as any).full_name} (${user?.email})`
          : (user?.email || 'Nhà Tuyển Dụng'),
        company_name: user?.email ? `Doanh Nghiệp (${user.email.split('@')[1] || 'Recruiter Enterprise'})` : 'Doanh Nghiệp Tuyển Dụng',
        student_id: candidate.id,
        technical_score: techScore,
        soft_skills_score: softScore,
        recruiter_comment: comment,
        blind_spots: blindSpots
      });

      alert(`Đã lưu đánh giá phỏng vấn và gửi phản hồi Feedback Loop thành công cho sinh viên ${candidate.full_name || ''}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu feedback:', err);
      alert('Đã xảy ra lỗi khi lưu nhận xét.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        padding: '30px',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8b5cf6', letterSpacing: '0.5px' }}>
              🏢 RECRUITER INTERVIEW FEEDBACK LOOP
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#0f172a' }}>
              Đánh Giá Phỏng Vấn: {candidate.full_name || 'Ứng viên'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Scores */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={16} color="#eab308" /> Điểm Kỹ Thuật (1 - 10):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={techScore}
                  onChange={e => setTechScore(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#8b5cf6' }}
                />
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#8b5cf6', width: '40px', textAlign: 'right' }}>
                  {techScore}/10
                </span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} color="#3b82f6" /> Điểm Kỹ Năng Mềm (1 - 10):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={softScore}
                  onChange={e => setSoftScore(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#3b82f6' }}
                />
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6', width: '40px', textAlign: 'right' }}>
                  {softScore}/10
                </span>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={16} /> Nhận Xét & Đánh Giá Phỏng Vấn Thực Tế:
            </label>
            <textarea
              rows={4}
              placeholder="Nhập nhận xét chi tiết về chuyên môn, thái độ và mức độ phù hợp với vị trí tuyển dụng..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Blind Spots Input */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} color="#ef4444" /> Điểm Mù Kiến Thức & Kỹ Năng Cần Khắc Phục:
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Ví dụ: Tối ưu SQL Indexing, React Re-render, RESTful Standard..."
                value={blindSpotInput}
                onChange={e => setBlindSpotInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBlindSpot(); } }}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <button
                type="button"
                onClick={handleAddBlindSpot}
                style={{ padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                + Thêm
              </button>
            </div>

            {/* Blind Spot Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {blindSpots.map((spot, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    borderRadius: '6px',
                    border: '1px solid #fca5a5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {spot}
                  <X size={14} style={{ cursor: 'pointer' }} onClick={() => handleRemoveBlindSpot(spot)} />
                </span>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ padding: '10px 24px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
            >
              {isSubmitting ? 'Đang Lưu...' : '💾 Lưu Đánh Giá & Gửi Feedback Loop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
