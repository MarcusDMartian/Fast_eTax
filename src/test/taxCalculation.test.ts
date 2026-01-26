import { describe, it, expect } from 'vitest';
import { calculateTax, businessSectors } from '../mock/data';

describe('calculateTax Logic Verification', () => {
    const retailSector = businessSectors[0]; // VAT 1%, PIT 0.5%

    it('should exempt tax if annual revenue <= 100M VND', () => {
        const result = calculateTax(50000000, retailSector, 100000000);
        expect(result.vat).toBe(0);
        expect(result.pit).toBe(0);
        expect(result.total).toBe(0);
    });

    it('should calculate tax on full amount if not Group 2', () => {
        const amount = 10000000;
        const result = calculateTax(amount, retailSector, 200000000, false);
        expect(result.vat).toBe(Math.round(amount * 0.01));
        expect(result.pit).toBe(Math.round(amount * 0.005));
    });

    it('should deduct 500M threshold if isGroup2 is true (TT 152/2025)', () => {
        const revenue = 600000000; // 600M
        const result = calculateTax(revenue, retailSector, 600000000, true);

        // Taxable revenue = 600M - 500M = 100M
        const taxable = 100000000;
        expect(result.vat).toBe(Math.round(taxable * 0.01));
        expect(result.pit).toBe(Math.round(taxable * 0.005));
    });

    it('should return 0 tax if revenue <= 500M and isGroup2 is true', () => {
        const revenue = 500000000;
        const result = calculateTax(revenue, retailSector, 500000000, true);
        expect(result.total).toBe(0);
    });
});
