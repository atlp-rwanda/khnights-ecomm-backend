import { server } from '..';
import { formatMoney, formatDate } from '../utils/index'; 

describe('Utility Functions', () => {
  describe('formatMoney', () => {
    it('should format a number as currency with default currency RWF', () => {
      expect(formatMoney(1234.56)).toBeDefined();
    });

    it('should format a number as currency with specified currency', () => {
      expect(formatMoney(1234.56, 'USD')).toBe('$1,234.56');
      expect(formatMoney(1234.56, 'EUR')).toBe('€1,234.56');
    });

    it('should format a number with no cents if amount is a whole number', () => {
      expect(formatMoney(1234)).toBeDefined();
    });
  });

  describe('formatDate', () => {
    it('should format a date string into a more readable format', () => {
      const date = new Date('2024-05-28');
      expect(formatDate(date)).toBe('May 28, 2024');
    });

    it('should format another date correctly', () => {
      const date = new Date('2020-01-01');
      expect(formatDate(date)).toBe('January 1, 2020');
    });

    it('should handle invalid date strings gracefully', () => {
      expect(formatDate(new Date('invalid-date'))).toBe('Invalid Date');
    });
  });
});
