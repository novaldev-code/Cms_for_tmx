import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const dismissToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setToast(null);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({
      id: Date.now(),
      message,
      type,
    });

    timeoutRef.current = setTimeout(
      () => {
        setToast(null);
        timeoutRef.current = null;
      },
      type === 'error' ? 6000 : 4000,
    );
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast ? (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <span className="toast__dot" aria-hidden="true" />
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__close"
            type="button"
            onClick={dismissToast}
            aria-label="Tutup notifikasi"
          >
            ×
          </button>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast harus dipakai di dalam ToastProvider');
  }

  return context;
}
