import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaxCalculatorPage from '../pages/calculator/TaxCalculatorPage';
import { useAppStore } from '../store';
import React from 'react';

// Mock matchMedia for Ant Design components
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock Ant Design Charts
vi.mock('@ant-design/charts', () => ({
    Line: () => <div data-testid="mock-line-chart" />,
    Pie: () => <div data-testid="mock-pie-chart" />,
}));

describe('TaxCalculatorPage UI Verification', () => {
    beforeEach(async () => {
        const store = useAppStore.getState();
        await store.login('test@example.com', 'password');
    });

    it('should display zero tax when revenue is 500M (TT 152/2025)', async () => {
        render(<TaxCalculatorPage />);

        const input = screen.getAllByRole('spinbutton')[0];
        fireEvent.change(input, { target: { value: '500000000' } });

        await waitFor(() => {
            expect(screen.getAllByText(/0 VND/).length).toBeGreaterThan(0);
        });
    });

    it('should display non-zero tax when revenue is 600M', async () => {
        render(<TaxCalculatorPage />);

        const input = screen.getAllByRole('spinbutton')[0];
        fireEvent.change(input, { target: { value: '600000000' } });

        await waitFor(() => {
            expect(screen.getByText(/1,500,000/)).toBeInTheDocument();
        });
    });
});
