import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { I18nProvider } from './contexts/I18nContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ErrorBoundary>
          <I18nProvider>
            <App />
          </I18nProvider>
        </ErrorBoundary>
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>
);
