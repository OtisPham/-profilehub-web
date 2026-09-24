import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import AddProjectModal from '../../components/projects/AddProjectModal';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import ProjectFilePreviewHeader from '../../components/projects/ProjectFilePreviewHeader';
import ProjectQRCodeModal from '../../components/student/ProjectQRCodeModal';
import type { VerificationStatus } from '../../types/database';


// Khai báo kiểu dữ liệu khớp với database
interface Project {
  id: string;
  title: string;
  project_type: string;
  score: string;
  description: string;
  is_verified: boolean;
  role: string;
  team_size: string;
  instructor: string;
  tags: string[];
  image_url: string;
  verification_status?: VerificationStatus;
  teacher_feedback?: string;
}

export default function MyProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [qrModalProject, setQrModalProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hàm gọi API lấy dữ liệu động
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('student_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Ép kiểu để mảng tags không bị lỗi nếu null
      const formattedData = data.map(item => ({
        ...item,
        tags: item.tags || []
      }));
      setProjects(formattedData);
    }
    setLoading(false);
  }, [user?.id]);

  // Hàm xử lý xóa đồ án
  const handleDelete = async (projectId: string) => {
    // Hiển thị hộp thoại xác nhận cơ bản của trình duyệt
    const isConfirm = window.confirm("Bạn có chắc chắn muốn xóa đồ án này không? Hành động này không thể hoàn tác.");
    if (!isConfirm) return;

    // Gọi API xóa từ Supabase
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      alert("Lỗi khi xóa: " + error.message);
    } else {
      // Gọi lại hàm fetchProjects để cập nhật lại danh sách trên giao diện
      fetchProjects();
    }
  };

  // Hàm mở Modal Thêm mới
const handleAddNew = () => {
  setEditingProject(null); // Đảm bảo form trống
  setIsModalOpen(true);
};

// Hàm mở Modal Sửa (nhận vào dữ liệu đồ án)
const handleEdit = (proj: Project) => {
  setEditingProject(proj); // Gắn dữ liệu cũ vào
  setIsModalOpen(true);
};


  // Xử lý gọi hàm an toàn không bị báo lỗi Floating Promise
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await fetchProjects();
      }
    };
    loadData();
  }, [user, fetchProjects]);

  return (
    <div style={{ padding: '0', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header */}
        <header style={{ height: '70px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            <span>Portal</span> <span style={{ margin: '0 8px' }}>/</span> <span style={{ color: '#0f172a', fontWeight: '500' }}>Student Portfolio</span>
          </div>
          <input type="text" placeholder="Search portfolios, skills, courses..." style={{ padding: '10px 15px', width: '300px', borderRadius: '20px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontWeight: '500' }}>{user?.email}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Thanh hướng dẫn trạng thái */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: '#eff6ff', padding: '10px 15px', borderRadius: '8px', fontSize: '13px', color: '#1e3a8a', fontWeight: '600' }}>
            <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '4px 12px', borderRadius: '6px' }}>1. Danh sách đồ án (Grid View)</div>
            <div>2. Drawer/Modal thêm mới</div>
            <div>3. Modal xác nhận xóa</div>
            <div>4. Trạng thái trống (Empty State)</div>
          </div>

          {/* Tiêu đề & Nút thao tác */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#3b82f6', letterSpacing: '1px', marginBottom: '5px' }}>ACADEMIC PORTFOLIO REPOSITORY</div>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#0f172a' }}>My Projects (Quản lý Đồ án)</h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Quản lý và giới thiệu các đồ án môn học, khóa luận tốt nghiệp và giải án cá nhân.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ padding: '10px 15px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                🔗 Xem trên Portfolio công khai
              </button>
              <button onClick={handleAddNew} style={{ padding: '10px 15px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                + Thêm đồ án mới
              </button>
            </div>
          </div>

          {/* Banner Đồng bộ CV */}
          <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🔄</span>
              <div>
                <strong style={{ fontSize: '13px', color: '#0369a1' }}>Đã đồng bộ vào CV xuất bản</strong>
                <div style={{ fontSize: '12px', color: '#0284c7' }}>Đồ án của bạn đã được gắn vào sơ yếu lý lịch tự động trên CV Builder.</div>
              </div>
            </div>
            <a href="#" style={{ fontSize: '13px', color: '#0369a1', fontWeight: 'bold', textDecoration: 'none' }}>Xem bản dựng CV ↗</a>
          </div>

          {/* Thanh Công cụ */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
              <input type="text" placeholder="🔍 Tìm kiếm đồ án theo tên, công nghệ, giảng viên..." style={{ padding: '10px 15px', width: '350px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              <select style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: 'white', color: '#475569' }}>
                <option>Trạng thái: Tất cả</option>
                <option>Đã xác thực</option>
                <option>Chờ xác thực</option>
              </select>
            </div>
          </div>

          {/* Bộ lọc Tags */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '5px' }}>
            <span style={{ padding: '6px 15px', backgroundColor: '#1e3a8a', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Tất cả ({projects.length})</span>
            <span style={{ padding: '6px 15px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap' }}>Khóa luận Tốt nghiệp</span>
            <span style={{ padding: '6px 15px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap' }}>Đồ án chuyên ngành</span>
            <span style={{ padding: '6px 15px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap' }}>Nghiên cứu Khoa học</span>
          </div>

          {/* Lưới hiển thị Đồ án */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
            
            {loading ? (
              <p>Đang tải dữ liệu đồ án...</p>
            ) : projects.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', color: '#64748b' }}>Chưa có đồ án nào trong hệ thống.</p>
            ) : (
              projects.map((proj) => (
                <div key={proj.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <ProjectFilePreviewHeader project={proj} />

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Status Badge */}
                    <div style={{ marginBottom: '12px' }}>
                      {(proj.verification_status === 'verified' || proj.is_verified) ? (
                        <VerifiedBadge teacherName={proj.instructor} size="sm" />
                      ) : proj.verification_status === 'rejected' ? (
                        <div style={{ display: 'inline-block', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                          ❌ Cần chỉnh sửa theo góp ý của Giảng viên
                        </div>
                      ) : (
                        <div style={{ display: 'inline-block', backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                          ⏳ Chờ Giảng viên duyệt (Pending)
                        </div>
                      )}
                    </div>

                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a', lineHeight: '1.4' }}>{proj.title}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {proj.description}
                    </p>

                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                        <span style={{ color: '#64748b' }}>Vai trò:</span>
                        <strong style={{ color: '#0f172a' }}>{proj.role || 'Thành viên'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                        <span style={{ color: '#64748b' }}>Nhóm:</span>
                        <strong style={{ color: '#0f172a' }}>{proj.team_size || '1 thành viên'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#64748b' }}>Giảng viên HĐ:</span>
                        <strong style={{ color: '#0f172a' }}>{proj.instructor || 'Chưa ghi nhận'}</strong>
                      </div>
                    </div>

                    {/* Hiển thị nhận xét của Giảng viên nếu bị từ chối */}
                    {proj.teacher_feedback && proj.verification_status === 'rejected' && (
                      <div style={{ fontSize: '11px', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '8px 10px', borderRadius: '6px', marginBottom: '15px', borderLeft: '3px solid #ef4444' }}>
                        💬 <strong>Nhận xét từ GV:</strong> {proj.teacher_feedback}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      {proj.tags && proj.tags.map(tag => (
                        <span key={tag} style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '4px' }}>{tag}</span>
                      ))}
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                      {(proj.verification_status === 'verified' || proj.is_verified) && (
                        <button
                          onClick={() => setQrModalProject(proj as any)}
                          style={{ padding: '8px 10px', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          📱 Mã QR
                        </button>
                      )}
                      {proj.verification_status !== 'verified' && !proj.is_verified && (
                        <button
                          onClick={async () => {
                            let targetInstructor = proj.instructor;
                            if (!targetInstructor || targetInstructor.trim() === '' || targetInstructor === 'Chưa ghi nhận') {
                              const inputInstructor = window.prompt("Vui lòng nhập Email hoặc Tên của Giảng viên hướng dẫn để gửi yêu cầu xác thực:");
                              if (!inputInstructor || !inputInstructor.trim()) {
                                alert("Bạn cần nhập thông tin Giảng viên để gửi yêu cầu xác thực.");
                                return;
                              }
                              targetInstructor = inputInstructor.trim();
                            }

                            const { error } = await supabase.from('projects').update({
                              verification_status: 'pending',
                              instructor: targetInstructor
                            }).eq('id', proj.id);

                            if (error) {
                              alert("Lỗi khi gửi yêu cầu xác thực: " + error.message);
                            } else {
                              alert(`Đã gửi yêu cầu xác thực tới Hộp thư của Giảng viên (${targetInstructor})!`);
                              fetchProjects();
                            }
                          }}
                          style={{ padding: '8px 10px', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          🛡️ Gửi Duyệt
                        </button>
                      )}
                      <button onClick={() => handleEdit(proj)} style={{ flex: 1, padding: '8px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>✏️ Sửa</button>
                      <button onClick={() => handleDelete(proj.id)} style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Render QR Modal */}
            {qrModalProject && (
              <ProjectQRCodeModal project={qrModalProject as any} onClose={() => setQrModalProject(null)} />
            )}

            {/* Thẻ Upload Đồ án (Empty State Card) */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', minHeight: '400px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', marginBottom: '15px' }}>
                +
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a' }}>Đăng tải đồ án mới</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
                Tải lên báo cáo đồ án, mã nguồn, link github, video demo để ghi nhận chứng thực từ giảng viên hướng dẫn.
              </p>
              <button onClick={() => setIsModalOpen(true)} style={{ padding: '10px 20px', backgroundColor: 'white', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                Khởi tạo hồ sơ đồ án →
              </button>
            </div>

          </div>
        </div>
        <AddProjectModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingProject(null); }} 
          onSuccess={fetchProjects} 
          editData={editingProject} 
        />
    </div>
  );
}
