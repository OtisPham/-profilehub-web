import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthProvider';
import { Bell, Clock, Video, MapPin, CheckCircle, X } from 'lucide-react';

interface StudentNotificationItem {
  id: string;
  title: string;
  interview_date: string;
  interview_time: string;
  meeting_link: string;
  interview_location: string;
  recruiter_name: string;
  is_read: boolean;
  is_confirmed?: boolean;
}

export default function MainLayout() {
  const { user, userRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>([]);

  useEffect(() => {
    if (userRole === 'student') {
      const localPipeline = JSON.parse(
        localStorage.getItem(`pipeline_${user?.id || 'default'}`) ||
        localStorage.getItem(`pipeline_default`) ||
        localStorage.getItem(`pipeline_rec1`) ||
        '[]'
      );

      const interviewItems = localPipeline.filter((p: any) => p.stage === 'interview' || p.interview_date);

      if (interviewItems.length > 0) {
        const formatted: StudentNotificationItem[] = interviewItems.map((iv: any, idx: number) => ({
          id: `notif_${iv.id || idx}`,
          title: `Lịch phỏng vấn vị trí ${iv.student?.major || 'Thực tập sinh'}`,
          interview_date: iv.interview_date || '2026-09-26',
          interview_time: iv.interview_time || '10:00 AM',
          meeting_link: iv.meeting_link || 'https://meet.google.com/abc-defg-hij',
          interview_location: iv.interview_location || 'Online (Google Meet)',
          recruiter_name: 'Enterprise Tech Corp',
          is_read: false
        }));
        setNotifications(formatted);
      } else {
        setNotifications([
          {
            id: 'notif_1',
            title: 'Lịch phỏng vấn mới từ Nhà Tuyển Dụng Enterprise Tech Corp',
            interview_date: '2026-09-26',
            interview_time: '10:00 AM',
            meeting_link: 'https://meet.google.com/abc-defg-hij',
            interview_location: 'Online (Google Meet)',
            recruiter_name: 'Enterprise Tech Corp',
            is_read: false
          }
        ]);
      }
    }
  }, [userRole, user?.id]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleConfirmInterview = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_confirmed: true, is_read: true } : n));
    alert('Đã gửi phản hồi xác nhận tham gia buổi phỏng vấn thành công!');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minWidth: 0, position: 'relative' }}>
        
        {/* Global Notification Header Bar for Students */}
        {userRole === 'student' && (
          <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '10px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>🎓 Student Workspace</span>
              <span>/</span>
              <span style={{ color: '#0f172a' }}>Hệ Thống Thông Báo Lịch Phỏng Vấn</span>
            </div>

            {/* Notification Bell Icon Dropdown Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: unreadCount > 0 ? '#f5f3ff' : '#f1f5f9',
                  border: unreadCount > 0 ? '1px solid #ddd6fe' : '1px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative'
                }}
              >
                <Bell size={16} color={unreadCount > 0 ? '#7c3aed' : '#64748b'} />
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: unreadCount > 0 ? '#7c3aed' : '#334155' }}>
                  Thông báo {unreadCount > 0 && `(${unreadCount})`}
                </span>
                {unreadCount > 0 && (
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
                )}
              </button>

              {/* Notification Center Dropdown */}
              {showNotifications && (
                <div style={{ position: 'absolute', right: 0, top: '42px', width: '380px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Bell size={14} color="#7c3aed" /> Thông Báo Lịch Phỏng Vấn ({notifications.length})
                    </div>
                    <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                        Chưa có thông báo lịch phỏng vấn nào.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} onClick={() => handleMarkAsRead(n.id)} style={{ padding: '14px', borderBottom: '1px solid #f1f5f9', backgroundColor: n.is_read ? '#ffffff' : '#faf5ff', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b21a8' }}>🏢 {n.recruiter_name}</span>
                            {!n.is_read && <span style={{ fontSize: '9px', fontWeight: 'bold', backgroundColor: '#ef4444', color: 'white', padding: '1px 6px', borderRadius: '10px' }}>MỚI</span>}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>{n.title}</div>

                          <div style={{ fontSize: '11px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '3px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={11} color="#6d28d9" /> <strong>Thời gian:</strong> {n.interview_date} lúc {n.interview_time}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={11} /> <strong>Địa điểm:</strong> {n.interview_location}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <a
                              href={n.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              style={{ flex: 1, padding: '5px 8px', backgroundColor: '#7c3aed', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            >
                              <Video size={11} /> Vào Meet
                            </a>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleConfirmInterview(n.id); }}
                              style={{ padding: '5px 8px', backgroundColor: n.is_confirmed ? '#ecfdf5' : '#f1f5f9', color: n.is_confirmed ? '#047857' : '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <CheckCircle size={11} color={n.is_confirmed ? '#047857' : '#64748b'} /> {n.is_confirmed ? 'Đã xác nhận' : 'Xác nhận'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
}
