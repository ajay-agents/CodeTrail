import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface DialogContextValue {
  showDialog: (node: ReactNode) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<ReactNode>(null);

  const showDialog = useCallback((n: ReactNode) => setNode(n), []);
  const closeDialog = useCallback(() => setNode(null), []);

  useEffect(() => {
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDialog();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [node, closeDialog]);

  return (
    <DialogContext.Provider value={{ showDialog, closeDialog }}>
      {children}
      <div id="dlg">{node}</div>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within DialogProvider');
  return ctx;
}
