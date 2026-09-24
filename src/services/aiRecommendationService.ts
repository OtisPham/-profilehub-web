import { fetchStudentFeedbacks } from './feedbackService';

export interface AIProjectRecommendation {
  id: string;
  title: string;
  target_blind_spot: string;
  rationale: string;
  recruiter_source: string;
  recommended_tech_stack: string[];
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  estimated_duration: string;
  feature_backlog: string[];
  definition_of_done: string[];
  created_at: string;
}

/**
 * Generate a personalized AI Project Recommendation tailored to student's knowledge blind spots
 */
export async function generateAIProjectRecommendation(studentId: string): Promise<AIProjectRecommendation> {
  const feedbacks = await fetchStudentFeedbacks(studentId);

  // Default fallback recommendation if no feedback exists
  if (!feedbacks || feedbacks.length === 0) {
    return {
      id: `rec-default-${Date.now()}`,
      title: 'Xây Dựng Hệ Thống Quản Lý Đồ Án & API Gateway Chuẩn RESTful',
      target_blind_spot: 'Thiết kế RESTful API & Cấu trúc Mô hình Clean Architecture',
      rationale: 'Khuyến nghị tiêu chuẩn dành cho sinh viên CNTT: Giúp xây dựng nền tảng kiến thức backend vững chắc và chuẩn hóa tài liệu Swagger OpenAPI trước khi phỏng vấn.',
      recruiter_source: 'ProfileHub AI Career Engine',
      recommended_tech_stack: ['TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker'],
      difficulty: 'Trung bình',
      estimated_duration: '7 - 10 ngày',
      feature_backlog: [
        'Xây dựng RESTful Endpoints với CRUD chuẩn HTTP status code',
        'Tích hợp Middleware Authentication JWT & Authorization Roles',
        'Tự động khởi tạo Swagger/OpenAPI Documentation',
        'Đóng gói Containerization ứng dụng với Docker Compose'
      ],
      definition_of_done: [
        '100% API endpoints vượt qua Unit Test và Integration Test',
        'Tài liệu Swagger UI truy cập trực tiếp tại endpoint /api-docs',
        'File docker-compose.yml khởi chạy ứng dụng thành công chỉ với 1 lệnh'
      ],
      created_at: new Date().toISOString()
    };
  }

  // Pick top feedback with blind spots
  const primaryFeedback = feedbacks[0];
  const primarySpot = primaryFeedback.blind_spots[0] || 'Tối ưu hoá Truy vấn & Cấu trúc Mã Nguồn';

  let title = `Xây Dựng Hệ Thống Chuyên Sâu Khắc Phục Lỗ Hổng "${primarySpot}"`;
  let techStack = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis'];
  let difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao' = 'Trung bình';
  let duration = '7 - 10 ngày';
  let features = [
    `Xây dựng mô đun trọng tâm giải quyết triệt để vấn đề: ${primarySpot}`,
    'Thiết kế giao diện dashboard trực quan hiển thị chỉ số đo lường hiệu năng',
    'Viết bộ test tự động kiểm thử khả năng chịu tải và xử lý ngoại lệ'
  ];
  let dod = [
    `Chứng minh chỉ số cải thiện rõ rệt cho chủ đề ${primarySpot}`,
    'Mã nguồn được đóng gói sạch sẽ với hướng dẫn cài đặt chi tiết trên GitHub README',
    'Sẵn sàng gửi Giảng viên duyệt cấp nhãn Verified Badge 🛡️'
  ];

  if (primarySpot.toLowerCase().includes('sql') || primarySpot.toLowerCase().includes('index')) {
    title = 'Xây Dựng Hệ Thống Caching & Indexing Tối Ưu Truy Vấn Dữ Liệu Lớn';
    techStack = ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Prisma ORM'];
    difficulty = 'Nâng cao';
    duration = '10 - 14 ngày';
    features = [
      'Thiết kế Cấu trúc B-Tree Index cho các bảng có lượt đọc lớn (> 1,000,000 dòng)',
      'Tích hợp Redis Cache Layer (Read-Through & Write-Through caching patterns)',
      'Viết script Benchmark đo thời gian phản hồi (Response Time) trước và sau tối ưu',
      'Xây dựng Dashboard giám sát tỷ lệ Cache Hit/Miss Rate realtime'
    ];
    dod = [
      'Thời gian phản hồi truy vấn giảm từ > 500ms xuống < 30ms',
      'Tỷ lệ Cache Hit Rate đạt tối thiểu 85% dưới tải mô phỏng 500 RPS',
      'Kèm file báo cáo so sánh chi tiết kèm lệnh EXPLAIN ANALYZE'
    ];
  } else if (primarySpot.toLowerCase().includes('react') || primarySpot.toLowerCase().includes('render')) {
    title = 'Xây Dựng Real-time Collaboration Dashboard Tối Ưu Hiệu Năng Rendering';
    techStack = ['React 19', 'TypeScript', 'Tailwind CSS', 'WebSockets', 'Vite'];
    difficulty = 'Trung bình';
    duration = '7 - 10 ngày';
    features = [
      'Xây dựng Real-time Canvas/Board hỗ trợ 100+ phần tử tương tác cùng lúc',
      'Áp dụng memoization (React.memo, useMemo, useCallback) triệt để tránh re-render',
      'Quản lý state phức tạp bằng Zustand/Redux Toolkit tách biệt UI và logic',
      'Tích hợp Profiler Tool đo đạc khung hình FPS chuẩn 60fps'
    ];
    dod = [
      'Không xảy ra tình trạng sụt giảm FPS khi có nhiều sự kiện trigger liên tục',
      'React Profiler ghi nhận 0 re-render thừa trên các component con',
      'Deploy sản phẩm chạy mượt mà trên môi trường Vercel/Netlify'
    ];
  } else if (primarySpot.toLowerCase().includes('api') || primarySpot.toLowerCase().includes('rest')) {
    title = 'Xây Dựng API Gateway & Rate Limiting System Chuẩn OpenAPI 3.0';
    techStack = ['Node.js', 'Express', 'TypeScript', 'Swagger', 'Redis'];
    difficulty = 'Trung bình';
    duration = '7 - 10 ngày';
    features = [
      'Xây dựng API Gateway đóng vai trò Reverse Proxy và Router cho Microservices',
      'Tích hợp Middleware Rate Limiter theo thuật toán Token Bucket / Leaky Bucket',
      'Chuẩn hóa format trả về RFC 7807 Problem Details cho tất cả HTTP errors',
      'Tự động sinh tài liệu API tương tác công khai với Swagger UI'
    ];
    dod = [
      'Bảo vệ hệ thống thành công trước các cuộc tấn công spam request (HTTP 429)',
      'Tài liệu Swagger UI hiển thị trực quan 100% endpoints',
      'Được kiểm thử tự động bằng Postman / Supertest'
    ];
  }

  return {
    id: `rec-${Date.now()}`,
    title,
    target_blind_spot: primarySpot,
    rationale: `Dựa trên phản hồi từ phỏng vấn thực tế của ${primaryFeedback.recruiter_name} (${primaryFeedback.company_name}): "${primaryFeedback.recruiter_comment}"`,
    recruiter_source: `${primaryFeedback.recruiter_name} • ${primaryFeedback.company_name}`,
    recommended_tech_stack: techStack,
    difficulty,
    estimated_duration: duration,
    feature_backlog: features,
    definition_of_done: dod,
    created_at: new Date().toISOString()
  };
}
