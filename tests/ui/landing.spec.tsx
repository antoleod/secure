import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '@/contexts/I18nContext';
import { LandingPage } from '@/pages/Landing';

describe('LandingPage', () => {
    it('renders primary CTAs and headline', () => {
        render(
            <MemoryRouter>
                <I18nProvider>
                    <LandingPage />
                </I18nProvider>
            </MemoryRouter>
        );

        expect(screen.getAllByText(/Apply now/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Login/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/collateral/i).length).toBeGreaterThan(0);
    });
});
