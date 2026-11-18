import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/app.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProgressProvider } from './context/ProgressContext';
import { DialogProvider } from './context/DialogContext';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <DialogProvider>
          <ProgressProvider>
            <App />
          </ProgressProvider>
        </DialogProvider>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>,
);
