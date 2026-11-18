import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  UNAUTHORIZED_EVENT,
} from '../services/api.js';

const AuthContext = createContext(null);

export { AuthContext };

const EMPTY_SESSION = {
  status: 'unauthenticated',
  admin: null,
  csrfToken: null,
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState({
    status: 'loading',
    admin: null,
    csrfToken: null,
  });

  useEffect(() => {
    let active = true;

    function handleUnauthorized() {
      if (active) {
        setSession(EMPTY_SESSION);
      }
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

    getCurrentAdmin()
      .then((data) => {
        if (active) {
          setSession({
            status: 'authenticated',
            admin: data.admin,
            csrfToken: data.csrfToken,
          });
        }
      })
      .catch(() => {
        if (active) {
          setSession(EMPTY_SESSION);
        }
      });

    return () => {
      active = false;
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const data = await loginAdmin({ email, password });

    setSession({
      status: 'authenticated',
      admin: data.admin,
      csrfToken: data.csrfToken,
    });

    return data;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutAdmin(session.csrfToken);
    } catch (error) {
      if (error.status !== 401) {
        throw error;
      }
    }

    setSession(EMPTY_SESSION);
  }, [session.csrfToken]);

  const value = useMemo(
    () => ({
      ...session,
      signIn,
      signOut,
    }),
    [session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }

  return context;
}
