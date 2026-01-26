import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store';

describe('AppStore Logic Verification', () => {
    beforeEach(async () => {
        const store = useAppStore.getState();
        await store.login('test@example.com', 'password');
    });

    it('should correctly calculate annual summary', async () => {
        const store = useAppStore.getState();
        // Since we are using mock data initially, let's check if it exists
        const summary = store.getAnnualSummary(2025);
        expect(summary.totalRevenue).toBeGreaterThan(0);
    });

    it('should handle HKD profile updates', () => {
        const store = useAppStore.getState();
        const newName = 'Cửa Hàng Mới 123';
        store.updateHKD({ name: newName });

        expect(useAppStore.getState().hkd?.name).toBe(newName);
    });
});
