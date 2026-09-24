export interface ProjectMatchDetail {
  id: string;
  title: string;
  isVerified: boolean;
  matchedSkills: string[];
  relevanceScore: number;
}

export interface PortfolioMatchResult {
  overallScore: number;
  matchRating: 'Excellent' | 'Good' | 'Moderate' | 'Needs Improvement';
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  projectMatches: ProjectMatchDetail[];
  recommendedProjectIdea: {
    title: string;
    description: string;
    keyTechStack: string[];
    expectedImpact: string;
  };
  optimizationTips: string[];
}

export interface PresetJobRole {
  id: string;
  title: string;
  category: string;
  defaultJd: string;
  requiredSkills: string[];
}
