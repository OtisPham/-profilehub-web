import { supabase } from './supabase';
import type { InterviewFeedback } from '../types/database';

export interface BlindSpotAnalysis {
  averageTechScore: number;
  averageSoftScore: number;
  overallGrade: string;
  topBlindSpots: string[];
  remedialRecommendations: {
    spot: string;
    actionPlan: string;
    recommendedProject: string;
  }[];
}

const STORAGE_KEY = 'profilehub_interview_feedbacks';

/**
 * Fetch feedbacks for a given student
 */
export async function fetchStudentFeedbacks(studentId: string): Promise<InterviewFeedback[]> {
  try {
    const { data, error } = await supabase
      .from('interview_feedbacks')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Extract recruiter IDs to fetch real emails and names
      const recruiterIds = Array.from(new Set(data.map(item => item.recruiter_id).filter(Boolean)));
      let recruiterMap = new Map();

      if (recruiterIds.length > 0) {
        const { data: recruitersData } = await supabase
          .from('users')
          .select('id, email, full_name')
          .in('id', recruiterIds);
        
        if (recruitersData) {
          recruiterMap = new Map(recruitersData.map(r => [r.id, r]));
        }
      }

      return data.map(item => {
        const rUser = recruiterMap.get(item.recruiter_id);
        const rName = item.recruiter_name || rUser?.full_name || rUser?.email || 'Nhà Tuyển Dụng';
        const rEmail = rUser?.email ? ` (${rUser.email})` : '';

        return {
          ...item,
          recruiter_name: `${rName}${rEmail && !rName.includes(rEmail) ? rEmail : ''}`,
          blind_spots: item.blind_spots || []
        };
      });
    }

    // Check localStorage for user-generated feedback
    const local = localStorage.getItem(`${STORAGE_KEY}_${studentId}`);
    if (local) {
      return JSON.parse(local);
    }

    // If no feedback exists yet in DB or local storage, return empty array
    return [];
  } catch (err) {
    console.error('Error fetching interview feedbacks:', err);
    return [];
  }
}

/**
 * Save new recruiter interview feedback
 */
export async function saveInterviewFeedback(feedback: Omit<InterviewFeedback, 'id' | 'created_at'>): Promise<InterviewFeedback> {
  const newFeedback: InterviewFeedback = {
    ...feedback,
    id: `fb-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  try {
    await supabase.from('interview_feedbacks').insert([newFeedback]);
  } catch (err) {
    console.warn('Supabase insert failed, using local storage backup:', err);
  }

  // Update local storage state
  const existing = await fetchStudentFeedbacks(feedback.student_id);
  const updated = [newFeedback, ...existing];
  localStorage.setItem(`${STORAGE_KEY}_${feedback.student_id}`, JSON.stringify(updated));

  return newFeedback;
}

/**
 * AI Engine: Analyze Blind Spots & Generate Action Plan
 */
export function analyzeStudentBlindSpots(feedbacks: InterviewFeedback[]): BlindSpotAnalysis {
  if (feedbacks.length === 0) {
    return {
      averageTechScore: 0,
      averageSoftScore: 0,
      overallGrade: 'Chưa có đánh giá',
      topBlindSpots: ['Chưa có dữ liệu phỏng vấn từ Nhà tuyển dụng'],
      remedialRecommendations: []
    };
  }

  const totalTech = feedbacks.reduce((acc, f) => acc + f.technical_score, 0);
  const totalSoft = feedbacks.reduce((acc, f) => acc + f.soft_skills_score, 0);
  const averageTechScore = Number((totalTech / feedbacks.length).toFixed(1));
  const averageSoftScore = Number((totalSoft / feedbacks.length).toFixed(1));

  let overallGrade: string;
  const avgOverall = (averageTechScore + averageSoftScore) / 2;
  if (avgOverall >= 8.5) overallGrade = 'Xuất Sắc';
  else if (avgOverall >= 7.5) overallGrade = 'Tốt';
  else if (avgOverall >= 6.0) overallGrade = 'Khá';
  else overallGrade = 'Cần Cải Thiện';

  // Aggregate blind spots frequency
  const spotCountMap: Record<string, number> = {};
  feedbacks.forEach(f => {
    f.blind_spots.forEach(spot => {
      spotCountMap[spot] = (spotCountMap[spot] || 0) + 1;
    });
  });

  const sortedSpots = Object.keys(spotCountMap).sort((a, b) => spotCountMap[b] - spotCountMap[a]);
  const topBlindSpots = sortedSpots.slice(0, 5);

  const remedialRecommendations = topBlindSpots.map(spot => {
    let actionPlan = `Nghiên cứu chuyên sâu chủ đề "${spot}", đọc tài liệu kỹ thuật chính thức và viết các ví dụ mã nguồn minh họa.`;
    let recommendedProject = `Xây dựng 1 Đồ án mini bổ trợ tập trung giải quyết triệt để vấn đề ${spot}.`;

    if (spot.toLowerCase().includes('sql') || spot.toLowerCase().includes('index')) {
      actionPlan = 'Đọc tài liệu PostgreSQL/MySQL về B-Tree Index, EXPLAIN ANALYZE và tối ưu câu lệnh JOIN lớn.';
      recommendedProject = 'Đồ án: Dashboard Phân Tích Dữ Liệu 1M Records Tối Ưu Tốc Độ Truy Vấn < 50ms.';
    } else if (spot.toLowerCase().includes('react') || spot.toLowerCase().includes('render')) {
      actionPlan = 'Tìm hiểu sâu về React Reconciliation, React.memo, useMemo/useCallback và profiler tools trong React DevTools.';
      recommendedProject = 'Đồ án: Real-time Collaborative Board tránh Re-render thừa khi có 100+ cursor hoạt động.';
    } else if (spot.toLowerCase().includes('api') || spot.toLowerCase().includes('rest')) {
      actionPlan = 'Học chuẩn RESTful Naming Conventions, HTTP Status Codes, OpenAPI Spec 3.0 và API Rate Limiting.';
      recommendedProject = 'Đồ án: API Gateway đính kèm Swagger Documentation & Rate Limiter Middleware.';
    } else if (spot.toLowerCase().includes('async') || spot.toLowerCase().includes('promise')) {
      actionPlan = 'Thực hành try/catch async, Promise.allSettled(), handling microtasks vs macrotasks trong JS Event Loop.';
      recommendedProject = 'Đồ án: Multi-thread File Downloader & Stream Processing Node.js Script.';
    }

    return {
      spot,
      actionPlan,
      recommendedProject
    };
  });

  return {
    averageTechScore,
    averageSoftScore,
    overallGrade,
    topBlindSpots,
    remedialRecommendations
  };
}
