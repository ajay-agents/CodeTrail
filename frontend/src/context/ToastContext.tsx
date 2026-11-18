import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

interface ToastContextValue {
  toast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const queue = useRef<string[]>([]);
  const busy = useRef(false);

  const next = useCallback(() => {
    const m = queue.current.shift();
    if (!m) {
      busy.current = false;
      return;
    }
    busy.current = true;
    setMessage(m);
    setShow(true);
    setTimeout(() => {
      setShow(false);
      setTimeout(next, 320);
    }, 1500);
  }, []);

  const toast = useCallback(
    (msg: string) => {
      queue.current.push(msg);
      if (!busy.current) next();
    },
    [next],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div id="toast" role="status" aria-live="polite" className={show ? 'show' : ''}>
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
