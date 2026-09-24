import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { UserRole } from '../types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userRole: 'student',
  loading: true,
  refreshUserRole: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(true);

  const fetchUserRole = useCallback(async (userId: string, metadataRole?: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data?.role) {
        setUserRole(data.role as UserRole);
      } else if (metadataRole) {
        setUserRole(metadataRole as UserRole);
      } else {
        setUserRole('student');
      }
    } catch {
      setUserRole((metadataRole as UserRole) || 'student');
    }
  }, []);

  const refreshUserRole = useCallback(async () => {
    if (user?.id) {
      await fetchUserRole(user.id, user.user_metadata?.role);
    }
  }, [user, fetchUserRole]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserRole(currentUser.id, currentUser.user_metadata?.role).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserRole(currentUser.id, currentUser.user_metadata?.role).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  return (
    <AuthContext.Provider value={{ session, user, userRole, loading, refreshUserRole }}>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '20vh', fontFamily: 'Inter, sans-serif' }}>
          <h2>⏳ Đang kết nối hệ thống PROFILEHUB...</h2>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
