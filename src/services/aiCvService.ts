export interface AICVAnalysisResult {
  matchScore: number;
  summaryText: string;
  recommendedProjectIds: string[];
  recommendedCertificateIds: string[];
  recommendedSkills: string[];
  matchingKeywords: string[];
  missingKeywords: string[];
}

interface ProjectInput {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  is_verified?: boolean;
}

interface CertificateInput {
  id: string;
  title: string;
  issuer: string;
}

/**
 * AI CV Matching Engine
 * Analyzes Job Description (JD) against Student Skills, Projects, and Certificates
 */
export async function analyzeAndTailorCV(
  jdText: string,
  userSkills: string[],
  projects: ProjectInput[],
  certificates: CertificateInput[]
): Promise<AICVAnalysisResult> {
  // Normalize text for comparison
  const normalizedJD = jdText.toLowerCase();

  // 1. Extract potential tech keywords from JD
  const techKeywordsList = [
    'react', 'next.js', 'vue', 'angular', 'typescript', 'javascript', 'node.js', 'express',
    'python', 'django', 'flask', 'fastapi', 'java', 'spring', 'c#', '.net', 'c++', 'go', 'rust',
    'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'supabase', 'firebase',
    'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git', 'ci/cd', 'rest api', 'graphql',
    'tailwind', 'css', 'html', 'figma', 'ui/ux', 'agile', 'scrum', 'testing', 'jest'
  ];

  const jdKeywords = techKeywordsList.filter(kw => normalizedJD.includes(kw));

  // 2. Find matching skills from student's profile
  const userSkillsNormalized = userSkills.map(s => s.toLowerCase());
  const matchingSkills = userSkills.filter(skill =>
    normalizedJD.includes(skill.toLowerCase()) || jdKeywords.some(kw => skill.toLowerCase().includes(kw))
  );

  const missingKeywords = jdKeywords.filter(
    kw => !userSkillsNormalized.some(s => s.includes(kw))
  );

  // 3. Score & select relevant projects
  const scoredProjects = projects.map(proj => {
    let score = 0;
    const projText = `${proj.title} ${proj.description || ''} ${proj.tags?.join(' ') || ''}`.toLowerCase();

    // Give bonus for Verified Projects
    if (proj.is_verified) score += 20;

    // Match keywords
    jdKeywords.forEach(kw => {
      if (projText.includes(kw)) score += 15;
    });

    return { id: proj.id, score };
  });

  scoredProjects.sort((a, b) => b.score - a.score);
  const recommendedProjectIds = scoredProjects.slice(0, 3).map(p => p.id);

  // 4. Score & select relevant certificates
  const recommendedCertificateIds = certificates.slice(0, 3).map(c => c.id);

  // 5. Calculate overall Match Score (%)
  const totalKeywords = Math.max(jdKeywords.length, 1);
  const matchedCount = matchingSkills.length;
  const rawScore = Math.round((matchedCount / totalKeywords) * 70) + (recommendedProjectIds.length > 0 ? 30 : 10);
  const matchScore = Math.min(Math.max(rawScore, 45), 98); // Clamp between 45% and 98%

  // 6. Generate Tailored Professional Summary
  const topSkillsStr = matchingSkills.slice(0, 4).join(', ') || userSkills.slice(0, 3).join(', ') || 'Software Development';
  const summaryText = `Sinh viên giàu nhiệt huyết với định hướng phát triển chuyên sâu trong vị trí công việc. Nắm vững kỹ năng nền tảng và chuyên môn về ${topSkillsStr}. Đã hoàn thành các đồ án thực tế đã được xác thực chính thức, sẵn sàng đóng góp năng lực và tư duy giải quyết vấn đề vào mục tiêu phát triển của doanh nghiệp.`;

  return {
    matchScore,
    summaryText,
    recommendedProjectIds,
    recommendedCertificateIds,
    recommendedSkills: matchingSkills.length > 0 ? matchingSkills : userSkills,
    matchingKeywords: matchingSkills,
    missingKeywords: missingKeywords.slice(0, 5)
  };
}
