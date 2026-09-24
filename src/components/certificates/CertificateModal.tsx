import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthProvider';

export interface CertificateData {
  id?: string;
  title: string;
  issuer: string;
  category: string;
  date_awarded: string;
  rank: string;
  description: string;
  is_featured: boolean;
  image_url?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: CertificateData | null;
}

export default function CertificateModal({ isOpen, onClose, onSuccess, editData }: Props) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState<CertificateData>({
    title: '', issuer: '', category: 'Học thuật & NCKH', date_awarded: '', rank: '', description: '', is_featured: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
    const timer = setTimeout(() => {
      if (editData) {
        setFormData(editData);
      } else {
        setFormData({ 
          title: '', issuer: '', category: 'Học thuật & NCKH', date_awarded: '', rank: '', description: '', is_featured: false 
        });
      }
      setFile(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [editData, isOpen]);

  if (!isOpen) return null;

  // Xử lý kéo thả file
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    let finalImageUrl = formData.image_url;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio_files')
        .upload(`certificates/${fileName}`, file);

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('portfolio_files')
          .getPublicUrl(`certificates/${fileName}`);
        finalImageUrl = publicUrlData.publicUrl;
      }
    }

    const payload = {
      user_id: user.id,
      title: formData.title,
      issuer: formData.issuer,
      category: formData.category,
      date_awarded: formData.date_awarded,
      rank: formData.rank,
      description: formData.description,
      is_featured: formData.is_featured,
      image_url: finalImageUrl
    };

    if (formData.id) {
      await supabase.from('certificates').update(payload).eq('id', formData.id);
    } else {
      await supabase.from('certificates').insert([payload]);
    }

    setSaving(false);
    onSuccess(); 
  };

  // Xác định URL để preview (Dùng file tạm nếu có chọn file mới, nếu không thì dùng link DB cũ)
  const previewUrl = file ? URL.createObjectURL(file) : formData.image_url;
  // Kiểm tra đuôi file để quyết định dùng thẻ img hay iframe
  const isPdf = file ? file.type === 'application/pdf' : formData.image_url?.toLowerCase().includes('.pdf');

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', gap: '30px' }}>
        
        {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#0f172a' }}>{editData ? 'Chỉnh sửa Chứng chỉ' : 'Thêm Chứng chỉ mới'}</h2>
          </div>

          <form id="cert-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Tên chứng chỉ / Giải thưởng *</label>
              <input required type="text" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Đơn vị cấp *</label>
                <input required type="text" value={formData.issuer} onChange={e => setFormData(prev => ({ ...prev, issuer: e.target.value }))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Danh mục</label>
                <select value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                  <option>Học thuật & NCKH</option>
                  <option>Cuộc thi & Hackathon</option>
                  <option>Chứng chỉ Chuyên môn</option>
                  <option>Kỹ năng Ngoại ngữ</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Thứ hạng / Kết quả</label>
                <input type="text" placeholder="VD: Giải Nhất, Score 990/1000" value={formData.rank} onChange={e => setFormData(prev => ({ ...prev, rank: e.target.value }))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Thời gian đạt được</label>
                <input type="text" placeholder="VD: 2024 hoặc 05/2025" value={formData.date_awarded} onChange={e => setFormData(prev => ({ ...prev, date_awarded: e.target.value }))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Mô tả ngắn</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}></textarea>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))} />
              ⭐ Đặt làm Thành tựu nổi bật nhất (Hiển thị to trên cùng)
            </label>
          </form>
        </div>

        {/* CỘT PHẢI: KHU VỰC KÉO THẢ & XEM TRƯỚC (LIVE PREVIEW) */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button type="button" onClick={onClose} style={{ padding: '0', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✖</button>
          </div>
          
          <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Tài liệu minh chứng</label>
          
          {/* Khu vực Drag & Drop */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
            style={{ 
              flex: 1, 
              border: isDragging ? '2px dashed #3b82f6' : '2px dashed #cbd5e1', 
              backgroundColor: isDragging ? '#eff6ff' : '#f8fafc', 
              borderRadius: '12px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              cursor: previewUrl ? 'default' : 'pointer', 
              position: 'relative', 
              overflow: 'hidden',
              minHeight: '250px'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*,application/pdf" 
              onChange={e => e.target.files && setFile(e.target.files[0])} 
              style={{ display: 'none' }} 
            />

            {previewUrl ? (
              <>
                {/* Nút xóa file để chọn lại */}
                <button 
                type="button" 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    setFile(null); 
                    setFormData(prev => ({ ...prev, image_url: undefined })); 
                    if (fileInputRef.current) {
                    fileInputRef.current.value = ''; 
                    }
                }}
                style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                title="Xóa file"
                >
                ✖
                </button>
                {/* Hiển thị PDF hoặc Ảnh */}
                {isPdf ? (
                  <iframe src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} style={{ width: '100%', height: '100%', border: 'none' }} title="Preview" />
                ) : (
                  <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px', boxSizing: 'border-box' }} alt="Preview" />
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📂</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>Kéo thả file vào đây</div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>hoặc click để chọn file<br/>(Hỗ trợ PDF, JPG, PNG)</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 20px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>Hủy</button>
            <button form="cert-form" type="submit" disabled={saving} style={{ padding: '12px 24px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {saving ? 'Đang lưu...' : 'Lưu Chứng chỉ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}