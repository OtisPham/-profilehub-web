import { useState } from 'react';
import { supabase } from '../../services/supabase';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Supabase tự động biết ai đang đăng nhập để đổi mật khẩu cho người đó
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setNewPassword(''); // Xóa trắng ô nhập sau khi đổi xong
    }
    
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px' }}>
      <h3>Đổi mật khẩu</h3>
      
      {message && (
        <p style={{ color: message.type === 'success' ? 'green' : 'red', fontWeight: 'bold' }}>
          {message.text}
        </p>
      )}

      <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="password"
          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading || newPassword.length < 6} 
          style={{ 
            padding: '10px', 
            backgroundColor: loading || newPassword.length < 6 ? '#ccc' : '#ff9800', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Đang cập nhật...' : 'Xác nhận đổi'}
        </button>
      </form>
    </div>
  );
}