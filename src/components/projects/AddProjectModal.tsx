import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthProvider';
import type { VerificationStatus } from '../../types/database';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: {
    id?: string;
    title?: string;
    project_type?: string;
    description?: string;
    role?: string;
    instructor?: string;
    score?: string;
    tags?: string[];
    image_url?: string;
    demo_url?: string;
    github_url?: string;
    figma_url?: string;
    doc_url?: string;
    is_verified?: boolean;
    verification_status?: VerificationStatus;
  } | null;
}

export default function AddProjectModal({ isOpen, onClose, onSuccess, editData }: AddProjectModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    project_type: 'Đồ án môn học',
    description: '',
    role: '',
    instructor: '',
    score: '',
    tags: '',
    github_url: '',
    demo_url: '',
    figma_url: '',
    doc_url: ''
  });

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        title: editData.title || '',
        project_type: editData.project_type || 'Đồ án môn học',
        description: editData.description || '',
        role: editData.role || '',
        instructor: editData.instructor || '',
        score: editData.score || '',
        tags: editData.tags ? editData.tags.join(', ') : '',
        github_url: editData.github_url || '',
        demo_url: editData.demo_url || '',
        figma_url: editData.figma_url || '',
        doc_url: editData.doc_url || ''
      });
    } else if (isOpen) {
      setFormData({
        title: '',
        project_type: 'Đồ án môn học',
        description: '',
        role: '',
        instructor: '',
        score: '',
        tags: '',
        github_url: '',
        demo_url: '',
        figma_url: '',
        doc_url: ''
      });
      setSelectedFile(null);
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (file.type === 'application/pdf' || file.type === 'text/html' || file.name.endsWith('.html')) {
      setSelectedFile(file);
    } else {
      setError('Tạm thời hệ thống chỉ hỗ trợ upload file mẫu định dạng .PDF hoặc .HTML');
    }
  };

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else if (e.type === "dragleave") setDragActive(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) validateAndSetFile(e.dataTransfer.files[0]); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { e.preventDefault(); if (e.target.files && e.target.files[0]) validateAndSetFile(e.target.files[0]); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalFileUrl = formData.demo_url || (editData ? editData.demo_url : '');

    if (selectedFile) {
      setUploadStatus(`Đang tải lên: ${selectedFile.name}...`);
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`; 

      const { error: uploadError } = await supabase.storage.from('portfolio_files').upload(filePath, selectedFile);

      if (uploadError) {
        setError(`Lỗi upload file: ${uploadError.message}`);
        setLoading(false); 
        setUploadStatus(null); 
        return;
      }
      const { data: urlData } = supabase.storage.from('portfolio_files').getPublicUrl(filePath);
      finalFileUrl = urlData.publicUrl;
      setUploadStatus('Upload thành công! Đang lưu hồ sơ...');
    }

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const defaultThumbnail = editData ? editData.image_url : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=500&q=60';

    const projectPayload = {
      student_id: user?.id,
      title: formData.title,
      project_type: formData.project_type,
      description: formData.description,
      role: formData.role,
      instructor: formData.instructor,
      score: formData.score,
      tags: tagsArray,
      image_url: defaultThumbnail, 
      demo_url: finalFileUrl,
      github_url: formData.github_url || null,
      figma_url: formData.figma_url || null,
      doc_url: formData.doc_url || null,
      is_verified: editData ? editData.is_verified : false,
      verification_status: editData?.verification_status || 'pending'
    };

    const { error: dbError } = editData
      ? await supabase.from('projects').update(projectPayload).eq('id', editData.id)
      : await supabase.from('projects').insert([projectPayload]);

    if (dbError) {
      setError(dbError.message);
    } else {
      onSuccess(); 
      onClose();   
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '680px', borderRadius: '12px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>{editData ? "Cập nhật Đồ án" : "Khởi tạo Đồ án mới"}</h2>
          <button onClick={onClose} disabled={loading} style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        {error && <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '6px', marginBottom: '15px', fontSize: '13px' }}>{error}</div>}
        {uploadStatus && <div style={{ padding: '10px', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>⏳ {uploadStatus}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
          
          <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => inputRef.current?.click()} style={{ border: dragActive ? '2px dashed #3b82f6' : '2px dashed #cbd5e1', backgroundColor: dragActive ? '#eff6ff' : '#f8fafc', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}>
            <input ref={inputRef} type="file" accept=".pdf,.html" style={{ display: 'none' }} onChange={handleChange} />
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{selectedFile ? '📄' : '📁'}</div>
            {selectedFile ? (
              <div><div style={{ fontSize: '14px', fontWeight: 'bold', color: '#059669' }}>Đã đính kèm: {selectedFile.name}</div><div style={{ fontSize: '12px', color: '#64748b' }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div></div>
            ) : (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>Kéo thả file báo cáo vào đây hoặc click để đính kèm (.PDF, .HTML)</div>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Tên đồ án *</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Loại đồ án</label><select value={formData.project_type} onChange={e => setFormData({...formData, project_type: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}><option>Đồ án môn học</option><option>Khóa luận Tốt nghiệp</option><option>Nghiên cứu Khoa học</option><option>Dự án cá nhân</option></select></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Điểm số</label><input type="text" value={formData.score} onChange={e => setFormData({...formData, score: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Vai trò</label><input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Giảng viên hướng dẫn</label><input type="text" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
          </div>

          {/* BỘ LINK ĐỒ ÁN HOÀN CHỈNH (MULTI-LINK SHOWCASE) */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '10px', textTransform: 'uppercase' }}>
              🚀 Bộ Link Sản Phẩm & Mã Nguồn (Tốt nhất cho Nhà tuyển dụng & Giảng viên)
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>💻 GitHub Repository URL</label>
                <input type="url" placeholder="https://github.com/username/repo" value={formData.github_url} onChange={e => setFormData({...formData, github_url: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>🌐 Live Web Demo URL</label>
                <input type="url" placeholder="https://my-app.vercel.app" value={formData.demo_url} onChange={e => setFormData({...formData, demo_url: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>🎨 Figma UI Design URL</label>
                <input type="url" placeholder="https://figma.com/file/..." value={formData.figma_url} onChange={e => setFormData({...formData, figma_url: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>📄 Báo cáo / Spec Doc URL</label>
                <input type="url" placeholder="https://... (Link PDF / Spec)" value={formData.doc_url} onChange={e => setFormData({...formData, doc_url: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Công nghệ (Cách nhau bởi dấu phẩy)</label><input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
          <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Mô tả ngắn *</label><textarea rows={2} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}></textarea></div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} disabled={loading} style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Đang xử lý...' : (editData ? 'Cập nhật' : 'Lưu đồ án')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}