import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthProvider';

export interface ProjectData {
  id?: string;
  student_id?: string;
  title: string;
  description: string;
  project_type: string;
  score: string;
  role: string;
  team_size: string;
  instructor: string;
  tags: string[];
  image_url?: string;
  demo_url?: string;
  github_url?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: ProjectData | null;
}

export default function ProjectModal({ isOpen, onClose, onSuccess, editData }: Props) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  
  const [formData, setFormData] = useState<ProjectData>({
    title: '', description: '', project_type: 'Đồ án môn học', score: '', role: '', team_size: '', instructor: '', tags: [], demo_url: '', github_url: ''
  });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (editData) {
                setFormData(editData);
                setTagsInput(editData.tags?.join(', ') || '');
            } else {
                setFormData({ title: '', description: '', project_type: 'Đồ án môn học', score: '', role: '', team_size: '', instructor: '', tags: [], demo_url: '', github_url: '' });
                setTagsInput('');
            }
            setFile(null);
        }, 0);
        return () => clearTimeout(timer);
    }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    let finalImageUrl = formData.image_url;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `projects/${user.id}-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('portfolio_files').upload(fileName, file);
      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage.from('portfolio_files').getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }
    }

    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');

    const payload = {
      student_id: user.id, // Sử dụng đúng tên cột của bạn
      title: formData.title,
      description: formData.description,
      project_type: formData.project_type,
      score: formData.score,
      role: formData.role,
      team_size: formData.team_size,
      instructor: formData.instructor,
      tags: tagsArray,     // Sử dụng đúng tên cột của bạn
      image_url: finalImageUrl,
      demo_url: formData.demo_url,
      github_url: formData.github_url
    };

    if (formData.id) {
      await supabase.from('projects').update(payload).eq('id', formData.id);
    } else {
      await supabase.from('projects').insert([payload]);
    }

    setSaving(false);
    onSuccess();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#0f172a' }}>{editData ? 'Sửa Đồ án' : 'Đăng tải đồ án mới'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Tên đồ án *</label>
            <input required type="text" value={formData.title} onChange={e => setFormData(prev => ({...prev, title: e.target.value}))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Loại đồ án</label>
              <select value={formData.project_type} onChange={e => setFormData(prev => ({...prev, project_type: e.target.value}))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                <option>Đồ án môn học</option>
                <option>Đồ án chuyên ngành</option>
                <option>Khóa luận Tốt nghiệp</option>
                <option>Nghiên cứu Khoa học</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Điểm số</label>
              <input type="text" value={formData.score || ''} onChange={e => setFormData(prev => ({...prev, score: e.target.value}))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Vai trò (VD: Fullstack)</label>
              <input type="text" value={formData.role || ''} onChange={e => setFormData(prev => ({...prev, role: e.target.value}))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Số lượng thành viên</label>
              <input type="text" value={formData.team_size || ''} onChange={e => setFormData(prev => ({...prev, team_size: e.target.value}))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Link GitHub</label>
              <input type="text" placeholder="https://github.com/..." value={formData.github_url || ''} onChange={e => setFormData(prev => ({...prev, github_url: e.target.value}))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Link Demo / Live</label>
              <input type="text" placeholder="https://..." value={formData.demo_url || ''} onChange={e => setFormData(prev => ({...prev, demo_url: e.target.value}))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Giảng viên hướng dẫn</label>
            <input type="text" value={formData.instructor || ''} onChange={e => setFormData(prev => ({...prev, instructor: e.target.value}))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Công nghệ sử dụng (Cách nhau bằng dấu phẩy)</label>
            <input type="text" placeholder="VD: ReactJS, MongoDB, Tailwind..." value={tagsInput} onChange={e => setTagsInput(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Mô tả ngắn</label>
            <textarea rows={3} value={formData.description || ''} onChange={e => setFormData(prev => ({...prev, description: e.target.value}))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}></textarea>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Ảnh bìa đồ án (Thumbnail)</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} style={{ width: '100%', marginTop: '5px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>
            <button type="submit" disabled={saving} style={{ padding: '10px 20px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{saving ? 'Đang lưu...' : 'Lưu Đồ án'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}