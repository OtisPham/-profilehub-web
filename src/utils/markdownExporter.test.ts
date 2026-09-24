import { exportRecommendationToMarkdown } from './markdownExporter';
import type { AIProjectRecommendation } from '../services/aiRecommendationService';

export function runMarkdownExporterTests(): boolean {
  console.log('[TDD TEST] Running markdownExporter Seam tests...');

  const sampleRec: AIProjectRecommendation = {
    id: 'rec-test-101',
    title: 'Xây Dựng System Caching High Throughput',
    target_blind_spot: 'SQL Indexing & Redis Caching',
    rationale: 'Dựa trên đánh giá từ HR Lead (hr.tech@vng.com.vn): Cần nâng cao kỹ năng truy vấn SQL.',
    recruiter_source: 'HR Lead (hr.tech@vng.com.vn) • VNG Corporation',
    recommended_tech_stack: ['Node.js', 'Redis', 'PostgreSQL'],
    difficulty: 'Nâng cao',
    estimated_duration: '7 - 10 ngày',
    feature_backlog: [
      'Thiết kế B-Tree Index cho bảng lớn',
      'Tích hợp Redis Read-Through Cache'
    ],
    definition_of_done: [
      'Response time < 30ms dưới tải 500 RPS'
    ],
    created_at: '2026-09-23T14:00:00.000Z'
  };

  const mdResult = exportRecommendationToMarkdown(sampleRec);

  // Assertion 1: Must contain target blind spot
  if (!mdResult.includes('SQL Indexing & Redis Caching')) {
    throw new Error('TDD Assertion Failed: Markdown output missing target blind spot');
  }

  // Assertion 2: Must contain real recruiter email source
  if (!mdResult.includes('hr.tech@vng.com.vn')) {
    throw new Error('TDD Assertion Failed: Markdown output missing recruiter email source');
  }

  // Assertion 3: Must format backlog items as checkboxes
  if (!mdResult.includes('[ ] **Thiết kế B-Tree Index cho bảng lớn**')) {
    throw new Error('TDD Assertion Failed: Markdown output missing checkbox backlog format');
  }

  console.log('[TDD TEST] All markdownExporter tests PASSED cleanly! 🟢');
  return true;
}

// Self-run when invoked
runMarkdownExporterTests();
