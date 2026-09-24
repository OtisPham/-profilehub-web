export interface HiringBrief {
  position: string;
  experienceLevel: string;
  location: string;
  availability: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  minProjectsCount: number;
}

export interface GeneratedJD {
  title: string;
  aboutRole: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  location: string;
  workType: string;
}

export interface CandidateMatchResult {
  candidateId: string;
  candidateName: string;
  matchScore: number;
  matchingMustHave: string[];
  matchingNiceToHave: string[];
  missingSkills: string[];
  whyText: string[];
  warningText?: string;
  verifiedProjectsCount: number;
}

/**
 * Parses natural language prompt into structured Hiring Brief
 */
export function parseHiringPrompt(promptText: string): HiringBrief {
  const text = promptText.toLowerCase();

  // Position detection
  let position = 'Thực Tập Sinh Phần Mềm / Designer';
  if (text.includes('ui/ux') || text.includes('figma') || text.includes('design')) position = 'Thực tập sinh UI/UX Designer';
  else if (text.includes('frontend') || text.includes('react') || text.includes('web')) position = 'Thực tập sinh Frontend Developer';
  else if (text.includes('backend') || text.includes('node') || text.includes('python')) position = 'Thực tập sinh Backend Developer';
  else if (text.includes('data') || text.includes('sql') || text.includes('machine learning')) position = 'Thực tập sinh Data Analyst / AI';
  else if (text.includes('marketing') || text.includes('seo') || text.includes('content')) position = 'Thực tập sinh Marketing / Content';

  // Skills detection
  const allTechSkills = [
    'Figma', 'UI/UX', 'User Research', 'Photoshop', 'Illustrator',
    'ReactJS', 'React', 'TypeScript', 'JavaScript', 'Node.js', 'Express',
    'Python', 'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'Tailwind', 'HTML/CSS',
    'REST API', 'GraphQL', 'Docker', 'Machine Learning', 'SEO'
  ];

  const mustHaveSkills: string[] = [];
  const niceToHaveSkills: string[] = [];

  allTechSkills.forEach(sk => {
    if (text.includes(sk.toLowerCase())) {
      mustHaveSkills.push(sk);
    }
  });

  // Default fallback skills if none detected
  if (mustHaveSkills.length === 0) {
    if (position.includes('UI/UX')) mustHaveSkills.push('Figma', 'UI/UX', 'User Research');
    else if (position.includes('Frontend')) mustHaveSkills.push('ReactJS', 'TypeScript', 'HTML/CSS');
    else mustHaveSkills.push('Git', 'Problem Solving', 'Teamwork');
  }

  // Nice-to-have additions
  if (position.includes('UI/UX') && !mustHaveSkills.includes('Photoshop')) niceToHaveSkills.push('Photoshop', 'English');
  if (position.includes('Frontend') && !mustHaveSkills.includes('Tailwind')) niceToHaveSkills.push('Tailwind', 'REST API');

  // Location detection
  let location = 'TP. Hồ Chí Minh';
  if (text.includes('hà nội') || text.includes('hanoi')) location = 'Hà Nội';
  else if (text.includes('đà nẵng') || text.includes('danang')) location = 'Đà Nẵng';
  else if (text.includes('remote') || text.includes('online')) location = 'Remote / Online';

  // Experience level parsing (Regex & Keyword detection)
  let experienceLevel = 'Sinh viên / Mới tốt nghiệp (Junior)';
  const expMatch = promptText.match(/(\d+[\s-–]*\d*)\s*(năm|năm kinh nghiệm|yrs|years)/i);
  if (expMatch) {
    experienceLevel = `${expMatch[1]} năm kinh nghiệm`;
  } else if (text.includes('senior')) {
    experienceLevel = 'Senior (3+ năm kinh nghiệm)';
  } else if (text.includes('middle') || text.includes('mid-level') || text.includes('mid level')) {
    experienceLevel = 'Middle (1-3 năm kinh nghiệm)';
  } else if (text.includes('thực tập') || text.includes('intern')) {
    experienceLevel = 'Thực tập sinh / Fresher';
  }

  // Availability
  let availability = 'Full-time';
  if (text.includes('part-time') || text.includes('bán thời gian')) availability = 'Part-time';

  // Project count
  let minProjectsCount = 1;
  if (text.includes('2 đồ án') || text.includes('2 projects') || text.includes('2 dự án')) minProjectsCount = 2;
  else if (text.includes('3 đồ án') || text.includes('3 projects')) minProjectsCount = 3;

  return {
    position,
    experienceLevel,
    location,
    availability,
    mustHaveSkills,
    niceToHaveSkills: niceToHaveSkills.length > 0 ? niceToHaveSkills : ['Tiếng Anh giao tiếp', 'Tư duy logic tốt'],
    minProjectsCount
  };
}

/**
 * Generates formatted Job Description based on Hiring Brief
 */
export function generateJobDescription(brief: HiringBrief): GeneratedJD {
  return {
    title: brief.position,
    aboutRole: `Công ty chúng tôi đang tìm kiếm vị trí ${brief.position} (${brief.experienceLevel}). Vị trí này sẽ trực tiếp tham gia xây dựng và triển khai các dự án thực tế cùng đội ngũ phát triển chuyên nghiệp.`,
    responsibilities: [
      `Tham gia phân tích, thiết kế và phát triển các tính năng theo yêu cầu vị trí ${brief.position}.`,
      `Phối hợp với Trưởng nhóm sản phẩm để đảm bảo tiến độ và chất lượng đồ án/sản phẩm.`,
      `Tham gia đánh giá mã nguồn (Code review) / Bản vẽ thiết kế (Design review) hàng tuần.`,
      `Báo cáo tiến độ công việc hàng ngày cho Quản lý trực tiếp.`
    ],
    requirements: [
      `Yêu cầu trình độ / kinh nghiệm: ${brief.experienceLevel}`,
      ...brief.mustHaveSkills.map(sk => `Thạo kỹ năng / công cụ: ${sk}`),
      `Có ít nhất ${brief.minProjectsCount} đồ án môn học hoặc thực tế rõ ràng`,
      `Thời gian làm việc: ${brief.availability}, địa điểm: ${brief.location}`,
      `Tinh thần chủ động, ham học hỏi và có trách nhiệm cao`
    ],
    niceToHave: brief.niceToHaveSkills,
    location: brief.location,
    workType: brief.availability
  };
}

/**
 * Matches candidates against job requirements and computes Match Score & Why reasons
 */
export function matchCandidatesWithJob(
  brief: HiringBrief,
  candidates: Array<{
    id: string;
    full_name: string;
    skills?: string[];
    verified_projects_count: number;
    projects: Array<{ title: string; is_verified?: boolean }>;
  }>
): CandidateMatchResult[] {
  return candidates.map(cand => {
    const candSkills = cand.skills?.map(s => s.toLowerCase()) || [];
    
    // Match Must-Have Skills
    const matchingMustHave = brief.mustHaveSkills.filter(sk =>
      candSkills.some(cs => cs.includes(sk.toLowerCase()) || sk.toLowerCase().includes(cs))
    );

    // Match Nice-To-Have Skills
    const matchingNiceToHave = brief.niceToHaveSkills.filter(sk =>
      candSkills.some(cs => cs.includes(sk.toLowerCase()) || sk.toLowerCase().includes(cs))
    );

    // Missing Must-Have Skills
    const missingSkills = brief.mustHaveSkills.filter(sk => !matchingMustHave.includes(sk));

    // Calculate score
    const mustHaveScore = (matchingMustHave.length / Math.max(brief.mustHaveSkills.length, 1)) * 60;
    const projectScore = Math.min((cand.projects.length / Math.max(brief.minProjectsCount, 1)) * 25, 25);
    const verifiedBonus = Math.min(cand.verified_projects_count * 5, 15);

    const rawScore = Math.round(mustHaveScore + projectScore + verifiedBonus);
    const matchScore = Math.min(Math.max(rawScore, 40), 99);

    // Build "Why this candidate?" explanation points
    const whyText: string[] = [];
    matchingMustHave.forEach(sk => whyText.push(`✓ Nắm vững kỹ năng bắt buộc: ${sk}`));
    if (cand.projects.length >= brief.minProjectsCount) {
      whyText.push(`✓ Có ${cand.projects.length} đồ án thực tế (Yêu cầu: ${brief.minProjectsCount}+)`);
    }
    if (cand.verified_projects_count > 0) {
      whyText.push(`🛡️ Có ${cand.verified_projects_count} đồ án được Giảng viên kiểm định chính thức`);
    }

    let warningText: string | undefined = undefined;
    if (missingSkills.length > 0) {
      warningText = `△ Chưa cập nhật kỹ năng: ${missingSkills.join(', ')}`;
    }

    return {
      candidateId: cand.id,
      candidateName: cand.full_name,
      matchScore,
      matchingMustHave,
      matchingNiceToHave,
      missingSkills,
      whyText,
      warningText,
      verifiedProjectsCount: cand.verified_projects_count
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
