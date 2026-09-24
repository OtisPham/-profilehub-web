import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../services/supabase';
import { Building2, MapPin, Mail, Save, CheckCircle2 } from 'lucide-react';

export default function RecruiterProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [recruiterName, setRecruiterName] = useState('');
  const [companyName, setCompanyName] = useState('TechCorp Solutions Vietnam');
  const [industry, setIndustry] = useState('Công Nghệ Thông Tin & Phần Mềm');
  const [companySize, setCompanySize] = useState('100 - 500 nhân viên');
  const [companyAddress, setCompanyAddress] = useState('Tòa nhà Innovation, Quận 1, TP. Hồ Chí Minh');
  const [website, setWebsite] = useState('https://techcorp.example.com');
  const [phone, setPhone] = useState('028 3822 9999');
  const [companyBio, setCompanyBio] = useState('TechCorp là tập đoàn công nghệ tiên phong cung cấp giải pháp phần mềm doanh nghiệp, điện toán đám mây và trí tuệ nhân tạo (AI). Chúng tôi tìm kiếm các tài năng trẻ thực hành đồ án thực tế.');

  useEffect(() => {
    const loadRecruiterProfile = async () => {
      if (!user) return;
      try {
        const { data } = await supabase.from('recruiter_profiles').select('*').eq('id', user.id).single();
        if (data) {
          setRecruiterName(data.recruiter_name || '');
          setCompanyName(data.company_name || 'TechCorp Solutions Vietnam');
          setIndustry(data.industry || 'Công Nghệ Thông Tin & Phần Mềm');
          setCompanySize(data.company_size || '100 - 500 nhân viên');
          setCompanyAddress(data.company_address || '');
          setWebsite(data.website || '');
          setPhone(data.phone || '');
          setCompanyBio(data.company_bio || '');
        } else {
          // Local storage fallback
          const localData = localStorage.getItem(`recruiter_profile_${user.id}`);
          if (localData) {
            const parsed = JSON.parse(localData);
            setRecruiterName(parsed.recruiterName || '');
            setCompanyName(parsed.companyName || 'TechCorp Solutions Vietnam');
            setIndustry(parsed.industry || 'Công Nghệ Thông Tin & Phần Mềm');
            setCompanySize(parsed.companySize || '100 - 500 nhân viên');
            setCompanyAddress(parsed.companyAddress || '');
            setWebsite(parsed.website || '');
            setPhone(parsed.phone || '');
            setCompanyBio(parsed.companyBio || '');
          } else {
            setRecruiterName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Nhà Tuyển Dụng');
          }
        }
      } catch (err) {
        console.warn("Load recruiter profile fallback:", err);
      }
    };

    loadRecruiterProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    const payload = {
      id: user?.id,
      recruiter_name: recruiterName,
      company_name: companyName,
      industry,
      company_size: companySize,
      company_address: companyAddress,
      website,
      phone,
      company_bio: companyBio,
      updated_at: new Date().toISOString()
    };

    // Fallback save to localStorage
    localStorage.setItem(`recruiter_profile_${user?.id || 'default'}`, JSON.stringify({
      recruiterName, companyName, industry, companySize, companyAddress, website, phone, companyBio
    }));

    try {
      if (user?.id) {
        await supabase.from('recruiter_profiles').upsert([payload]);
      }
    } catch (err) {
      console.warn("DB Upsert error fallback to local:", err);
    }

    setLoading(false);
    setSuccessMsg('Đã lưu thông tin Công ty & Nhà tuyển dụng thành công!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Banner */}
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8b5cf6', letterSpacing: '1px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} /> RECRUITER COMPANY PROFILE
          </div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', color: '#0f172a' }}>
            Hồ Sơ Doanh Nghiệp & Nhà Tuyển Dụng
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Cập nhật tên công ty, quy mô, website và trụ sở để thu hút các ứng viên sinh viên tài năng.
          </p>
        </div>

        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #ddd6fe' }}>
          🏢 Portal Nhà Tuyển Dụng
        </span>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', color: '#6d28d9', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 'bold' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Profile Form Card */}
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        
        {/* Section 1: Thông tin Doanh Nghiệp */}
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#6d28d9', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          <Building2 size={18} /> 1. Thông Tin Doanh Nghiệp (Company Details)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Tên Công ty / Doanh nghiệp *</label>
            <input
              type="text"
              required
              placeholder="VD: Tập đoàn Công nghệ FPT / VNG Corporation"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Tên Đại diện tuyển dụng *</label>
            <input
              type="text"
              required
              placeholder="VD: Tran Van B - Talent Acquisition Manager"
              value={recruiterName}
              onChange={e => setRecruiterName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Lĩnh vực hoạt động</label>
            <input
              type="text"
              placeholder="VD: Công Nghệ Thông Tin, FinTech, E-commerce"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Quy mô Công ty</label>
            <select
              value={companySize}
              onChange={e => setCompanySize(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: 'white' }}
            >
              <option>10 - 50 nhân viên</option>
              <option>50 - 100 nhân viên</option>
              <option>100 - 500 nhân viên</option>
              <option>500 - 1000 nhân viên</option>
              <option>1000+ nhân viên (Tập đoàn Enterprise)</option>
            </select>
          </div>
        </div>

        {/* Section 2: Địa chỉ & Trụ sở */}
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#6d28d9', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginTop: '10px' }}>
          <MapPin size={18} /> 2. Trụ Sở & Kênh Truyền Thông
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Địa chỉ Trụ sở chính *</label>
          <input
            type="text"
            required
            placeholder="VD: Tòa nhà Innovation Center, Công viên Phần mềm Quang Trung, Q.12, TP.HCM"
            value={companyAddress}
            onChange={e => setCompanyAddress(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Website Công ty</label>
            <input
              type="text"
              placeholder="VD: https://company.com"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Số điện thoại liên hệ</label>
            <input
              type="text"
              placeholder="VD: 028 3822 9999"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Section 3: Giới thiệu công ty & Văn hóa */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Email tuyển dụng chính (Hệ thống)</label>
          <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Mail size={16} /> {user?.email}
          </div>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Giới thiệu về Công ty & Văn hóa tuyển dụng</label>
          <textarea
            rows={4}
            placeholder="Nhập tầm nhìn, cơ hội phát triển cho thực tập sinh/junior và chế độ đãi ngộ..."
            value={companyBio}
            onChange={e => setCompanyBio(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px 24px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu Thông Tin Doanh Nghiệp'}
          </button>
        </div>

      </form>
    </div>
  );
}
