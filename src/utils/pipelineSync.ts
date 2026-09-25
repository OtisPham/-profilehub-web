import type { CandidatePipelineItem } from '../types/database';

const SHARED_KEY = 'pipeline_shared_data';

export const getSharedPipeline = (userId?: string): CandidatePipelineItem[] => {
  const filterOutMock = (list: CandidatePipelineItem[]) => {
    if (!Array.isArray(list)) return [];
    return list.filter(item => {
      const isMockId = ['p1', 'p2', 'p3', 's1', 's2', 's3', 'c1', 'c2', 'c3', 'st1', 'st2', 'st3'].includes(item.id) ||
                       ['s1', 's2', 's3', 'c1', 'c2', 'c3', 'st1', 'st2', 'st3'].includes(item.student_id);
      const isMockName = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng C'].includes(item.student?.full_name || '');
      return !isMockId && !isMockName;
    });
  };

  const shared = localStorage.getItem(SHARED_KEY);
  if (shared) {
    try {
      return filterOutMock(JSON.parse(shared));
    } catch {
      // Fallback
    }
  }

  // Check specific user key
  const userKeyData = userId ? localStorage.getItem(`pipeline_${userId}`) : null;
  if (userKeyData) {
    try {
      return filterOutMock(JSON.parse(userKeyData));
    } catch {
      // Fallback
    }
  }

  // Fallback default
  const defaultData = localStorage.getItem('pipeline_default');
  if (defaultData) {
    try {
      return filterOutMock(JSON.parse(defaultData));
    } catch {
      // Fallback
    }
  }

  return [];
};

export const saveSharedPipeline = (items: CandidatePipelineItem[], userId?: string) => {
  const jsonStr = JSON.stringify(items);
  localStorage.setItem(SHARED_KEY, jsonStr);
  localStorage.setItem('pipeline_default', jsonStr);
  if (userId) {
    localStorage.setItem(`pipeline_${userId}`, jsonStr);
  }
};

export const updateInterviewStatusByStudent = (studentId: string, status: 'confirmed' | 'cancelled') => {
  const items = getSharedPipeline();
  let updated = false;

  const newItems = items.map(item => {
    if (item.student_id === studentId || item.student?.id === studentId || item.id === studentId) {
      updated = true;
      return {
        ...item,
        interview_status: status,
        updated_at: new Date().toISOString()
      };
    }
    return item;
  });

  if (!updated && items.length > 0) {
    // Update first scheduled item if ID match was loose
    newItems[0] = {
      ...newItems[0],
      interview_status: status,
      updated_at: new Date().toISOString()
    };
  }

  saveSharedPipeline(newItems);
  return newItems;
};
