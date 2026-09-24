import type { AIProjectRecommendation } from '../services/aiRecommendationService';

/**
 * Convert AI Project Recommendation into clean, professional GitHub-flavored Markdown text
 */
export function exportRecommendationToMarkdown(recommendation: AIProjectRecommendation): string {
  const dateStr = new Date(recommendation.created_at).toLocaleDateString('vi-VN');
  
  return `# 🚀 SPEC: ${recommendation.title}

> **Nguồn Đề Xuất:** ${recommendation.recruiter_source}  
> **Điểm Mù Kiến Thức Cần Khắc Phục:** \`${recommendation.target_blind_spot}\`  
> **Mức Độ Kỹ Thuật:** ${recommendation.difficulty} | **Thời Gian Dự Kiến:** ${recommendation.estimated_duration}  
> **Ngày Tạo:** ${dateStr}

---

## 🎯 1. Lý Do Đề Xuất (Rationale)

${recommendation.rationale}

---

## 🛠️ 2. Công Nghệ Trọng Tâm (Recommended Tech Stack)

${recommendation.recommended_tech_stack.map(tech => `- \`${tech}\``).join('\n')}

---

## 📋 3. Danh Sách Tính Năng Cần Thực Hiện (Feature Backlog)

${recommendation.feature_backlog.map((feature, idx) => `${idx + 1}. [ ] **${feature}**`).join('\n')}

---

## ✅ 4. Tiêu Chí Hoàn Thành (Definition of Done)

${recommendation.definition_of_done.map(dod => `- [ ] ${dod}`).join('\n')}

---

## 🛡️ 5. Hướng Dẫn Nộp Đồ Án Lên ProfileHub

1. Khởi tạo Git Repository trên máy tính và đưa file này làm \`README.md\`.
2. Tiến hành gõ code và xây dựng ứng dụng theo đúng danh sách tính năng trên.
3. Push mã nguồn lên GitHub / GitLab.
4. Đăng nhập **ProfileHub** $\\rightarrow$ **Quản Lý Đồ Án** $\\rightarrow$ Bấm **"Đăng Tải Đồ Án Mới"** và gửi yêu cầu xác thực tới Giảng viên hướng dẫn để cấp con dấu **Verified Badge 🛡️**.

---
*Generated automatically by ProfileHub AI Knowledge-Gap Career Engine.*
`;
}

/**
 * Trigger browser file download for Markdown spec
 */
export function downloadMarkdownFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
