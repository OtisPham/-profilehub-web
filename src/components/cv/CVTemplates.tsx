import VerifiedBadge from '../common/VerifiedBadge';

export type CVTemplateType = 'classic' | 'minimal' | 'tech' | 'executive';

export interface CVDataProps {
  profile: {
    full_name?: string;
    major?: string;
    university?: string;
    gpa?: string;
    skills?: string[];
    bio?: string;
  } | null;
  userEmail: string;
  summary: string;
  primaryColor: string;
  selectedProjects: Array<{
    id: string;
    title: string;
    role?: string;
    project_type?: string;
    description?: string;
    is_verified?: boolean;
    instructor?: string;
    tags?: string[];
  }>;
  certificates: Array<{
    id: string;
    title: string;
    issuer: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    category?: string;
  }>;
}

export function RenderCVTemplate({ template, data }: { template: CVTemplateType; data: CVDataProps }) {
  const { profile, userEmail, summary, primaryColor, selectedProjects, certificates, achievements } = data;

  // TEMPLATE 1: CLASSIC (Modern Two-Column)
  if (template === 'classic') {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Header CV */}
        <div style={{ borderBottom: `3px solid ${primaryColor}`, paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '26px', color: primaryColor, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {profile?.full_name || 'HỌ VÀ TÊN SINH VIÊN'}
            </h1>
            <div style={{ fontSize: '14px', color: '#475569', marginTop: '4px', fontWeight: '600' }}>
              {profile?.major || 'Chuyên ngành Công nghệ thông tin'}
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569', lineHeight: '1.6' }}>
            <div>📧 {userEmail}</div>
            <div>📍 {profile?.university || 'Trường Đại Học'}</div>
          </div>
        </div>

        {/* Tóm tắt bản thân AI */}
        {summary && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', fontWeight: 'bold' }}>
              Mục Tiêu & Tóm Tắt Chuyên Môn (AI Tailored)
            </h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: '1.6' }}>{summary}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Cột Trái CV (35%) */}
          <div style={{ width: '35%' }}>
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', fontWeight: 'bold' }}>Học Vấn</h3>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>{profile?.university}</div>
              <div style={{ fontSize: '11px', color: '#475569', margin: '2px 0' }}>Chuyên ngành: {profile?.major}</div>
              {profile?.gpa && <div style={{ fontSize: '11px', color: '#059669', fontWeight: 'bold' }}>GPA: {profile?.gpa}</div>}
            </div>

            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', fontWeight: 'bold' }}>Kỹ Năng Chuyên Môn</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {profile?.skills?.map((s, idx) => (
                  <span key={idx} style={{ fontSize: '10px', padding: '3px 7px', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '4px' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {certificates.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', fontWeight: 'bold' }}>Chứng Chỉ & Bằng Cấp</h3>
                {certificates.map(c => (
                  <div key={c.id} style={{ marginBottom: '6px', fontSize: '11px' }}>
                    <strong style={{ color: '#0f172a', display: 'block' }}>{c.title}</strong>
                    <span style={{ color: '#64748b' }}>{c.issuer}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cột Phải CV (65%) */}
          <div style={{ width: '65%' }}>
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', fontWeight: 'bold' }}>
                Đồ Án & Dự Án Thực Tế (Academic Projects)
              </h3>

              {selectedProjects.length === 0 ? (
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Chưa chọn đồ án nào.</div>
              ) : (
                selectedProjects.map(p => (
                  <div key={p.id} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '12px', color: '#0f172a' }}>{p.title}</strong>
                      {p.is_verified && <VerifiedBadge teacherName={p.instructor} size="sm" />}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', margin: '2px 0 4px 0' }}>
                      Vai trò: {p.role || 'Thành viên'} | Loại: {p.project_type || 'Đồ án'}
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: '1.5' }}>{p.description}</p>
                  </div>
                ))
              )}
            </div>

            {achievements.length > 0 && (
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', fontWeight: 'bold' }}>Giải Thưởng & Thành Tích</h3>
                {achievements.map(a => (
                  <div key={a.id} style={{ marginBottom: '4px', fontSize: '11px' }}>
                    <strong style={{ color: '#0f172a' }}>{a.title}</strong> — <span style={{ color: '#64748b' }}>{a.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // TEMPLATE 2: MINIMALIST (Single Column Top-Down)
  if (template === 'minimal') {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
        {/* Header Centered */}
        <div style={{ textAlign: 'center', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '14px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '26px', color: primaryColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {profile?.full_name || 'HỌ VÀ TÊN SINH VIÊN'}
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 8px 0', fontWeight: '500' }}>
            {profile?.major} • {profile?.university}
          </div>
          <div style={{ fontSize: '11px', color: '#475569', display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <span>📧 {userEmail}</span>
            {profile?.gpa && <span>GPA: {profile?.gpa}</span>}
          </div>
        </div>

        {/* Tóm tắt */}
        {summary && (
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
              TÓM TẮT CHUYÊN MÔN
            </h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: '1.6' }}>{summary}</p>
          </div>
        )}

        {/* Kỹ năng */}
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
            KỸ NĂNG CHUYÊN MÔN
          </h3>
          <div style={{ fontSize: '11px', color: '#334155', lineHeight: '1.6' }}>
            {profile?.skills?.join(' • ')}
          </div>
        </div>

        {/* Đồ án Verified */}
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
            ĐỒ ÁN & DỰ ÁN NỔI BẬT (VERIFIED PROJECTS)
          </h3>
          {selectedProjects.map(p => (
            <div key={p.id} style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px dashed #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px', color: '#0f172a' }}>{p.title}</strong>
                {p.is_verified && <VerifiedBadge teacherName={p.instructor} size="sm" />}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', margin: '2px 0 4px 0' }}>
                Vai trò: {p.role || 'Thành viên'} | Công nghệ: {p.tags?.join(', ')}
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: '1.5' }}>{p.description}</p>
            </div>
          ))}
        </div>

        {/* Học vấn & Chứng chỉ */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
              HỌC VẤN
            </h3>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}>{profile?.university}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>Ngành: {profile?.major}</div>
          </div>

          {certificates.length > 0 && (
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
                CHỨNG CHỈ
              </h3>
              {certificates.map(c => (
                <div key={c.id} style={{ fontSize: '10px', marginBottom: '4px' }}>
                  <strong style={{ color: '#0f172a' }}>{c.title}</strong> ({c.issuer})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // TEMPLATE 3: TECH SPECIALIST (Contrast Dark Sidebar Layout)
  if (template === 'tech') {
    return (
      <div style={{ display: 'flex', minHeight: '270mm', fontFamily: "'Inter', sans-serif" }}>
        {/* Left Dark Sidebar (32%) */}
        <div style={{ width: '32%', backgroundColor: primaryColor, color: 'white', padding: '20px', boxSizing: 'border-box', borderRadius: '6px 0 0 6px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase' }}>
              {profile?.full_name || 'SINH VIÊN'}
            </h1>
            <div style={{ fontSize: '12px', color: '#93c5fd', marginTop: '4px', fontWeight: '500' }}>
              {profile?.major}
            </div>
          </div>

          <div style={{ fontSize: '10px', color: '#e0f2fe', lineHeight: '1.6', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '12px' }}>
            <div>📧 {userEmail}</div>
            <div>📍 {profile?.university}</div>
            {profile?.gpa && <div>🎓 GPA: {profile?.gpa}</div>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '1px' }}>KỸ NĂNG CORE</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {profile?.skills?.map((s, idx) => (
                <span key={idx} style={{ fontSize: '9px', padding: '3px 6px', backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '3px' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {certificates.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '1px' }}>CHỨNG CHỈ</h3>
              {certificates.map(c => (
                <div key={c.id} style={{ marginBottom: '6px', fontSize: '10px' }}>
                  <div style={{ fontWeight: 'bold', color: 'white' }}>{c.title}</div>
                  <div style={{ fontSize: '9px', color: '#cbd5e1' }}>{c.issuer}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Content Area (68%) */}
        <div style={{ width: '68%', padding: '20px', boxSizing: 'border-box' }}>
          {summary && (
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', color: primaryColor, textTransform: 'uppercase', fontWeight: 'bold', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '3px' }}>
                GIỚI THIỆU & MỤC TIÊU CÔNG VIỆC
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: '1.5' }}>{summary}</p>
            </div>
          )}

          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: primaryColor, textTransform: 'uppercase', fontWeight: 'bold', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '3px' }}>
              ĐỒ ÁN KỸ THUẬT XÁC THỰC (VERIFIED PROJECTS)
            </h3>

            {selectedProjects.map(p => (
              <div key={p.id} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '12px', color: '#0f172a' }}>{p.title}</strong>
                  {p.is_verified && <VerifiedBadge teacherName={p.instructor} size="sm" />}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', margin: '2px 0' }}>
                  Role: {p.role || 'Developer'} | Stack: {p.tags?.join(', ')}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: '1.5' }}>{p.description}</p>
              </div>
            ))}
          </div>

          {achievements.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', color: primaryColor, textTransform: 'uppercase', fontWeight: 'bold', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '3px' }}>
                THÀNH TÍCH NỔI BẬT
              </h3>
              {achievements.map(a => (
                <div key={a.id} style={{ fontSize: '10px', marginBottom: '4px' }}>
                  <strong style={{ color: '#0f172a' }}>{a.title}</strong> ({a.category})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // TEMPLATE 4: EXECUTIVE ACADEMIC (Formal Academic Layout)
  return (
    <div style={{ fontFamily: "'Georgia', serif", color: '#0f172a', padding: '10px' }}>
      {/* Border frame */}
      <div style={{ border: `2px solid ${primaryColor}`, padding: '15px' }}>
        <div style={{ textAlign: 'center', borderBottom: `1px solid ${primaryColor}`, paddingBottom: '12px', marginBottom: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', color: primaryColor, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {profile?.full_name || 'HỌ VÀ TÊN SINH VIÊN'}
          </h1>
          <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#475569', margin: '4px 0' }}>
            {profile?.major} — {profile?.university}
          </div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>
            Email: {userEmail} | Điểm GPA: {profile?.gpa || 'N/A'}
          </div>
        </div>

        {summary && (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', color: primaryColor, textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
              I. TỔNG QUAN HỒ SƠ VÀ MỤC TIÊU
            </h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: '1.6' }}>{summary}</p>
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: primaryColor, textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
            II. NĂNG LỰC ĐỒ ÁN & NGHIÊN CỨU KIỂM ĐỊNH
          </h3>
          {selectedProjects.map(p => (
            <div key={p.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px', color: '#0f172a' }}>{p.title}</strong>
                {p.is_verified && <VerifiedBadge teacherName={p.instructor} size="sm" />}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', margin: '1px 0 3px 0' }}>
                Vai trò đảm nhận: {p.role || 'Thành viên'} ({p.project_type})
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: '1.5' }}>{p.description}</p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', color: primaryColor, textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
            III. KỸ NĂNG & CHỨNG CHỈ
          </h3>
          <div style={{ fontSize: '11px', color: '#334155', marginBottom: '6px' }}>
            <strong>Kỹ năng:</strong> {profile?.skills?.join(', ')}
          </div>
          {certificates.map(c => (
            <div key={c.id} style={{ fontSize: '10px', color: '#475569' }}>
              • {c.title} (Cấp bởi {c.issuer})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
