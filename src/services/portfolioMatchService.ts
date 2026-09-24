import type { PortfolioMatchResult, PresetJobRole, ProjectMatchDetail } from '../types/portfolioMatch';

export const PRESET_JOB_ROLES: PresetJobRole[] = [
  {
    id: 'frontend-react',
    title: 'Frontend ReactJS Developer',
    category: 'Web Development',
    requiredSkills: ['ReactJS', 'TypeScript', 'TailwindCSS', 'Redux / Zustand', 'REST API', 'Git', 'Performance Optimization'],
    defaultJd: `Yêu cầu công việc:
- Có ít nhất 1 năm kinh nghiệm hoặc hoàn thành các đồ án thực tế với ReactJS, TypeScript.
- Nắm vững State Management (Redux, Zustand hoặc React Context), React Hooks, Lifecycle.
- Sử dụng thành thạo HTML5, CSS3, TailwindCSS hoặc Material-UI.
- Tối ưu hiệu năng render (React.memo, useMemo, lazy loading).
- Có kinh nghiệm tích hợp RESTful APIs, GraphQL và làm việc với Git.`
  },
  {
    id: 'backend-nodejs',
    title: 'Backend Node.js Developer',
    category: 'Backend & Cloud',
    requiredSkills: ['Node.js', 'Express.js', 'TypeScript', 'PostgreSQL / MySQL', 'MongoDB', 'Docker', 'JWT Authentication'],
    defaultJd: `Yêu cầu công việc:
- Xây dựng và thiết kế RESTful APIs chất lượng cao với Node.js, Express.js hoặc NestJS.
- Sử dụng thành thạo CSDL quan hệ (PostgreSQL, MySQL) hoặc NoSQL (MongoDB, Redis).
- Hiểu biết về Bảo mật API, Authentication/Authorization (JWT, OAuth2).
- Có kinh nghiệm viết Unit Test, Docker containerization và triển khai hệ thống.`
  },
  {
    id: 'fullstack-ts',
    title: 'Fullstack TypeScript Developer',
    category: 'Fullstack',
    requiredSkills: ['ReactJS', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Prisma / Supabase', 'TailwindCSS'],
    defaultJd: `Yêu cầu công việc:
- Phát triển ứng dụng Web end-to-end với Next.js (App Router), ReactJS và Node.js.
- Sử dụng TypeScript cho cả Frontend và Backend.
- Tương tác với CSDL PostgreSQL bằng Prisma ORM hoặc Supabase.
- Tối ưu SEO, Server-Side Rendering (SSR) và trải nghiệm người dùng.`
  },
  {
    id: 'mobile-react-native',
    title: 'Mobile App Developer (React Native)',
    category: 'Mobile',
    requiredSkills: ['React Native', 'Expo', 'TypeScript', 'Redux', 'REST API', 'Push Notifications', 'App Performance'],
    defaultJd: `Yêu cầu công việc:
- Lập trình ứng dụng di động iOS/Android bằng React Native / Expo.
- Tích hợp Native Modules, Push Notifications, Camera, Map APIs.
- Tối ưu tốc độ khởi động ứng dụng và bộ nhớ sử dụng.`
  }
];

interface StudentProjectInput {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  is_verified?: boolean;
}

interface StudentCertInput {
  id: string;
  title: string;
  issuer: string;
}

export async function analyzePortfolioMatch(
  jdText: string,
  userSkills: string[],
  projects: StudentProjectInput[],
  certificates: StudentCertInput[]
): Promise<PortfolioMatchResult> {
  const normalizedJD = jdText.toLowerCase();

  // Tech stack dictionary for matching
  const commonTechList = [
    'react', 'reactjs', 'next.js', 'vue', 'angular', 'typescript', 'javascript',
    'node.js', 'express', 'nest.js', 'python', 'django', 'fastapi', 'java', 'spring',
    'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'supabase', 'firebase',
    'docker', 'kubernetes', 'aws', 'git', 'ci/cd', 'rest api', 'graphql',
    'tailwind', 'tailwindcss', 'css', 'html', 'figma', 'ui/ux', 'unit testing', 'jest',
    'redux', 'zustand', 'jwt', 'prisma', 'expo', 'react native'
  ];

  // Extract skills mentioned in JD
  const jdRequiredTechs = commonTechList.filter(tech => normalizedJD.includes(tech));

  // Match student skills against JD
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  userSkills.forEach(skill => {
    const sLower = skill.toLowerCase();
    if (normalizedJD.includes(sLower) || jdRequiredTechs.some(tech => sLower.includes(tech))) {
      matchedSkills.push(skill);
    }
  });

  jdRequiredTechs.forEach(tech => {
    if (!userSkillsLower.some(us => us.includes(tech))) {
      missingSkills.push(tech.charAt(0).toUpperCase() + tech.slice(1));
    }
  });

  // Unique lists
  const uniqueMatched = Array.from(new Set(matchedSkills));
  const uniqueMissing = Array.from(new Set(missingSkills)).slice(0, 6);

  // Evaluate Projects
  const projectMatches: ProjectMatchDetail[] = projects.map(proj => {
    const projContent = `${proj.title} ${proj.description || ''} ${proj.tags?.join(' ') || ''}`.toLowerCase();
    const projMatchedSkills: string[] = [];

    jdRequiredTechs.forEach(tech => {
      if (projContent.includes(tech)) {
        projMatchedSkills.push(tech.charAt(0).toUpperCase() + tech.slice(1));
      }
    });

    let relevanceScore = Math.min(projMatchedSkills.length * 25, 80);
    if (proj.is_verified) {
      relevanceScore = Math.min(relevanceScore + 20, 100);
    }

    return {
      id: proj.id,
      title: proj.title,
      isVerified: !!proj.is_verified,
      matchedSkills: Array.from(new Set(projMatchedSkills)),
      relevanceScore
    };
  });

  projectMatches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Calculate Overall Match Score
  const skillMatchRatio = jdRequiredTechs.length > 0 
    ? (uniqueMatched.length / Math.max(jdRequiredTechs.length, 1)) 
    : 0.6;
    
  const hasVerifiedProject = projects.some(p => p.is_verified);
  const certBonus = certificates.length > 0 ? 10 : 0;
  const verifiedBonus = hasVerifiedProject ? 15 : 0;

  let rawScore = Math.round(skillMatchRatio * 65) + certBonus + verifiedBonus;
  if (projectMatches.length > 0 && projectMatches[0].relevanceScore >= 60) {
    rawScore += 10;
  }

  const overallScore = Math.min(Math.max(rawScore, 48), 96);

  let matchRating: PortfolioMatchResult['matchRating'] = 'Moderate';
  if (overallScore >= 85) matchRating = 'Excellent';
  else if (overallScore >= 70) matchRating = 'Good';
  else if (overallScore < 60) matchRating = 'Needs Improvement';

  // Recommend a project idea to close gaps
  const topMissing = uniqueMissing.slice(0, 3).join(', ') || 'Docker & Microservices';
  const recommendedProjectIdea = {
    title: `Đồ án Thực Tế: Enterprise Dashboard & ${uniqueMissing[0] || 'Fullstack Cloud'} Integration`,
    description: `Xây dựng ứng dụng hoàn chỉnh tích hợp ${topMissing} kết hợp với quy trình Authentication và tối ưu hiệu năng. Đồ án này giúp chứng minh trực tiếp năng lực đáp ứng 100% tiêu chí JD.`,
    keyTechStack: uniqueMissing.length > 0 ? uniqueMissing.slice(0, 4) : ['TypeScript', 'Docker', 'PostgreSQL', 'Redis'],
    expectedImpact: 'Tăng điểm tương thích Portfolio lên 90%+ và tạo điểm nhấn vượt trội với Nhà Tuyển Dụng nhờ đồ án nâng cao.'
  };

  const optimizationTips = [
    `Đưa các từ khóa kỹ năng chính (${uniqueMatched.slice(0, 3).join(', ') || 'ReactJS, TypeScript'}) lên đầu phần Giới Thiệu Bản Thân trong CV.`,
    hasVerifiedProject 
      ? 'Đồ án của bạn đã có xác thực từ Giảng viên. Hãy gắn Badge "Verified" rõ ràng ở phần Đồ án nổi bật.'
      : 'Gửi đồ án xuất sắc nhất của bạn cho Giảng viên duyệt để nhận Dấu Xác Thực (Verification Seal), tăng gấp đôi niềm tin từ Nhà Tuyển Dụng.',
    `Xây dựng thêm đồ án mẫu tích hợp các kỹ năng còn thiếu (${uniqueMissing.slice(0, 2).join(', ') || 'Docker'}) để lấp đầy lỗ hổng yêu cầu của JD.`
  ];

  const summary = `Portfolio hiện tại của bạn đạt mức độ tương thích ${overallScore}% với Mô tả công việc (JD). Bạn sở hữu ${uniqueMatched.length} kỹ năng phù hợp và ${projects.length} đồ án thực tế. Việc bổ sung các kỹ năng (${uniqueMissing.slice(0, 3).join(', ') || 'nâng cao'}) sẽ giúp bạn chinh phục vị trí này một cách thuyết phục nhất.`;

  return {
    overallScore,
    matchRating,
    summary,
    matchedSkills: uniqueMatched.length > 0 ? uniqueMatched : userSkills,
    missingSkills: uniqueMissing,
    projectMatches: projectMatches.slice(0, 3),
    recommendedProjectIdea,
    optimizationTips
  };
}
