import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { I18nProvider } from './contexts/I18nContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <I18nProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </I18nProvider>
        </ErrorBoundary>
    </StrictMode>
);
