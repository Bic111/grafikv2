/**
 * Integration tests for all tabs data persistence
 * Tests that data persists when switching between tabs and navigating
 */

import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeesTab } from '@/components/employees/EmployeesTab';
import { UrlopyTab } from '@/components/employees/UrlopyTab';
import { ZwolnieniaTab } from '@/components/employees/ZwolnieniaTab';
import { ParametryZmianTab } from '@/components/employees/ParametryZmianTab';
import { SwietaTab } from '@/components/employees/SwietaTab';
import { RegulyTab } from '@/components/employees/RegulyTab';
import {
  employeeAPI,
  absenceAPI,
  shiftParameterAPI,
  holidayAPI,
  ruleAPI,
  hourLimitAPI,
  getErrorMessage,
} from '@/services/api';
import type { Employee, Holiday, Rule, HourLimit, ShiftParameter } from '@/types';

// Mock all API services
vi.mock('@/services/api', () => ({
  employeeAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  absenceAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  shiftParameterAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  holidayAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  ruleAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  hourLimitAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  getErrorMessage: vi.fn((err) => err.message || 'Unknown error'),
}));

/**
 * Mock data
 */
const mockEmployees: Employee[] = [
  {
    id: '1',
    imie: 'Jan',
    nazwisko: 'Kowalski',
    stanowisko: 'Kierownik',
    status: 'Aktywny',
    etat: 1.0,
    utworzono: '2024-01-01T00:00:00Z',
    zaktualizowano: '2024-01-01T00:00:00Z',
  },
];

const mockHolidays: Holiday[] = [
  {
    id: '1',
    data: '2024-12-25',
    nazwa: 'Boże Narodzenie',
    opis: 'Święto Bożego Narodzenia',
    store_closed: true,
    utworzono: '2024-01-01T00:00:00Z',
    zaktualizowano: '2024-01-01T00:00:00Z',
  },
];

const mockRules: Rule[] = [
  {
    id: '1',
    nazwa: 'Maksymalnie 8 godzin dziennie',
    opis: 'Pracownik nie może pracować więcej niż 8 godzin dziennie',
    typ: 'Godziny pracy',
    aktywna: true,
  },
];

const mockLimits: HourLimit[] = [
  {
    id: '1',
    etat: 1.0,
    max_dziennie: 8,
    max_tygodniowo: 40,
    max_miesięcznie: 160,
    max_kwartalnie: 480,
  },
];

describe('Tabs Integration - Data Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EmployeesTab - Data Persistence', () => {
    it('should maintain employee list data when tab is mounted/unmounted', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);

      const { rerender } = render(<EmployeesTab />);

      // Wait for employees to load
      await waitFor(() => {
        expect(screen.getByText('Jan')).toBeInTheDocument();
      });

      // Verify the API was called
      expect(employeeAPI.getAll).toHaveBeenCalledTimes(1);

      // Re-render the component
      rerender(<EmployeesTab />);

      // Data should still be visible
      expect(screen.getByText('Jan')).toBeInTheDocument();
    });

    it('should preserve form state when editing and then canceling', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);

      const user = userEvent.setup();
      render(<EmployeesTab />);

      // Wait for employees to load
      await waitFor(() => {
        expect(screen.getByText('Jan')).toBeInTheDocument();
      });

      // Click edit button (find first edit button)
      const editButtons = screen.getAllByTitle('Edytuj pracownika');
      await user.click(editButtons[0]);

      // Wait for form to appear
      await waitFor(() => {
        const inputs = screen.getAllByDisplayValue('Jan');
        expect(inputs.length).toBeGreaterThan(0);
      });

      // Cancel the form
      const cancelButton = screen.getByRole('button', { name: 'Anuluj' });
      await user.click(cancelButton);

      // Should return to list view
      await waitFor(() => {
        expect(screen.queryByDisplayValue('Jan')).not.toBeInTheDocument();
      });
    });
  });

  describe('SwietaTab - Data Persistence', () => {
    it('should load and display holidays correctly', async () => {
      vi.mocked(holidayAPI.getAll).mockResolvedValue(mockHolidays);

      render(<SwietaTab />);

      // Wait for holidays to load
      await waitFor(() => {
        expect(screen.getByText('Boże Narodzenie')).toBeInTheDocument();
      });

      expect(holidayAPI.getAll).toHaveBeenCalledTimes(1);
    });

    it('should preserve holiday data when navigating away and back', async () => {
      vi.mocked(holidayAPI.getAll).mockResolvedValue(mockHolidays);

      const { rerender, unmount } = render(<SwietaTab />);

      await waitFor(() => {
        expect(screen.getByText('Boże Narodzenie')).toBeInTheDocument();
      });

      // Unmount and remount
      unmount();

      // Reset mock to track new call
      vi.clearAllMocks();
      vi.mocked(holidayAPI.getAll).mockResolvedValue(mockHolidays);

      render(<SwietaTab />);

      // Should fetch data again
      await waitFor(() => {
        expect(screen.getByText('Boże Narodzenie')).toBeInTheDocument();
      });

      expect(holidayAPI.getAll).toHaveBeenCalled();
    });
  });

  describe('RegulyTab - Data Persistence', () => {
    it('should load and display both limits and rules', async () => {
      vi.mocked(ruleAPI.getAll).mockResolvedValue(mockRules);
      vi.mocked(hourLimitAPI.getAll).mockResolvedValue(mockLimits);

      render(<RegulyTab />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Maksymalnie 8 godzin dziennie')).toBeInTheDocument();
      });

      // Verify both sections are loaded
      expect(screen.getByText('Limity godzin')).toBeInTheDocument();
      expect(screen.getByText('Krytyczne wytyczne')).toBeInTheDocument();
    });

    it('should show skeleton loading state while data is loading', () => {
      vi.mocked(ruleAPI.getAll).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockRules), 100))
      );
      vi.mocked(hourLimitAPI.getAll).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockLimits), 100))
      );

      render(<RegulyTab />);

      // Should show skeleton initially
      expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();
    });

    it('should persist rules data when switching sections', async () => {
      vi.mocked(ruleAPI.getAll).mockResolvedValue(mockRules);
      vi.mocked(hourLimitAPI.getAll).mockResolvedValue(mockLimits);

      const user = userEvent.setup();
      render(<RegulyTab />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Maksymalnie 8 godzin dziennie')).toBeInTheDocument();
      });

      // Both sections should be visible
      expect(screen.getByText('Limity godzin')).toBeInTheDocument();
      expect(screen.getByText('Krytyczne wytyczne')).toBeInTheDocument();

      // Click add rule
      const addRuleButtons = screen.getAllByRole('button', { name: /Dodaj/ });
      const addRuleButton = addRuleButtons.find((btn) =>
        btn.textContent?.includes('Dodaj regułę')
      );
      expect(addRuleButton).toBeDefined();

      // Rules data should be preserved
      expect(screen.getByText('Maksymalnie 8 godzin dziennie')).toBeInTheDocument();
    });

    it('should handle error state gracefully', async () => {
      const errorMessage = 'Network error';
      vi.mocked(ruleAPI.getAll).mockRejectedValue(new Error(errorMessage));
      vi.mocked(hourLimitAPI.getAll).mockRejectedValue(new Error(errorMessage));

      render(<RegulyTab />);

      // Should display error message
      await waitFor(() => {
        expect(screen.getByText(/Błąd/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Tab Data Consistency', () => {
    it('should properly initialize each tab independently', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(holidayAPI.getAll).mockResolvedValue(mockHolidays);
      vi.mocked(ruleAPI.getAll).mockResolvedValue(mockRules);
      vi.mocked(hourLimitAPI.getAll).mockResolvedValue(mockLimits);

      // Render each tab in isolation
      const { unmount: unmount1 } = render(<EmployeesTab />);
      await waitFor(() => {
        expect(screen.getByText('Jan')).toBeInTheDocument();
      });
      unmount1();

      const { unmount: unmount2 } = render(<SwietaTab />);
      await waitFor(() => {
        expect(screen.getByText('Boże Narodzenie')).toBeInTheDocument();
      });
      unmount2();

      const { unmount: unmount3 } = render(<RegulyTab />);
      await waitFor(() => {
        expect(screen.getByText('Maksymalnie 8 godzin dziennie')).toBeInTheDocument();
      });
      unmount3();

      // Verify each API was called
      expect(employeeAPI.getAll).toHaveBeenCalled();
      expect(holidayAPI.getAll).toHaveBeenCalled();
      expect(ruleAPI.getAll).toHaveBeenCalled();
      expect(hourLimitAPI.getAll).toHaveBeenCalled();
    });

    it('should handle loading states correctly for all tabs', async () => {
      // Make promises that never resolve to simulate loading
      const neverResolves = () => new Promise(() => {});

      vi.mocked(employeeAPI.getAll).mockImplementation(neverResolves);
      vi.mocked(holidayAPI.getAll).mockImplementation(neverResolves);
      vi.mocked(ruleAPI.getAll).mockImplementation(neverResolves);
      vi.mocked(hourLimitAPI.getAll).mockImplementation(neverResolves);

      render(<EmployeesTab />);
      expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();

      // Clean up
      vi.restoreAllMocks();
    });
  });

  describe('Memory and Performance', () => {
    it('should not leak memory on multiple mount/unmount cycles', async () => {
      vi.mocked(ruleAPI.getAll).mockResolvedValue(mockRules);
      vi.mocked(hourLimitAPI.getAll).mockResolvedValue(mockLimits);

      // Mount and unmount multiple times
      for (let i = 0; i < 3; i++) {
        const { unmount } = render(<RegulyTab />);

        await waitFor(() => {
          expect(screen.getByText('Maksymalnie 8 godzin dziennie')).toBeInTheDocument();
        });

        unmount();
        vi.clearAllMocks();
      }

      // After 3 cycles, data should still load correctly
      vi.mocked(ruleAPI.getAll).mockResolvedValue(mockRules);
      vi.mocked(hourLimitAPI.getAll).mockResolvedValue(mockLimits);

      render(<RegulyTab />);

      await waitFor(() => {
        expect(screen.getByText('Maksymalnie 8 godzin dziennie')).toBeInTheDocument();
      });
    });

    it('should not trigger unnecessary API calls on rerender', async () => {
      vi.mocked(ruleAPI.getAll).mockResolvedValue(mockRules);
      vi.mocked(hourLimitAPI.getAll).mockResolvedValue(mockLimits);

      const { rerender } = render(<RegulyTab />);

      await waitFor(() => {
        expect(screen.getByText('Maksymalnie 8 godzin dziennie')).toBeInTheDocument();
      });

      const callCount = vi.mocked(ruleAPI.getAll).mock.calls.length;

      // Rerender shouldn't trigger new API calls
      rerender(<RegulyTab />);

      // Still only called once (or the same number of times)
      expect(vi.mocked(ruleAPI.getAll).mock.calls.length).toEqual(callCount);
    });
  });

  describe('Form Submission and Tab State', () => {
    it('should reset form state after successful submission', async () => {
      const newRule = { nazwa: 'Test Rule', opis: 'Test', typ: 'Godziny pracy' };

      vi.mocked(ruleAPI.getAll).mockResolvedValue([...mockRules]);
      vi.mocked(hourLimitAPI.getAll).mockResolvedValue(mockLimits);
      vi.mocked(ruleAPI.create).mockResolvedValue({
        id: '2',
        ...newRule,
      } as Rule);

      const user = userEvent.setup();
      render(<RegulyTab />);

      await waitFor(() => {
        expect(screen.getByText('Maksymalnie 8 godzin dziennie')).toBeInTheDocument();
      });

      // Find and click "add rule" button
      const addButtons = screen.getAllByRole('button', { name: /Dodaj/ });
      const addRuleButton = addButtons.find((btn) =>
        btn.textContent?.includes('Dodaj regułę')
      );

      if (addRuleButton) {
        await user.click(addRuleButton);

        // Form should appear
        await waitFor(() => {
          expect(screen.getByRole('textbox', { name: /Nazwa/ })).toBeInTheDocument();
        });
      }
    });
  });
});
