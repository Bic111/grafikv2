/**
 * Integration tests for tabs data persistence and UI behavior
 */

/// <reference types="jest" />

import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { RegulyTab } from '@/components/employees/RegulyTab';
import { ruleAPI, hourLimitAPI } from '@/services/api';
import type { Rule, HourLimit } from '@/types';

// Mock all API services
jest.mock('@/services/api', () => ({
  ruleAPI: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    removeRule: jest.fn(),
  },
  hourLimitAPI: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    removeLimit: jest.fn(),
  },
  getErrorMessage: jest.fn((err: any) => err.message || 'Unknown error'),
}));

/**
 * Mock data
 */
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

describe('RegulyTab Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RegulyTab - Data Persistence', () => {
    it('should load and display both limits and rules', async () => {
      jest.mocked(ruleAPI.getAll).mockResolvedValue(mockRules as any);
      jest.mocked(hourLimitAPI.getAll).mockResolvedValue(mockLimits as any);

      render(<RegulyTab />);

      await waitFor(() => {
        expect(screen.getByText('Maksymalnie 8 godzin dziennie')).toBeInTheDocument();
      });

      expect(screen.getByText('Limity godzin')).toBeInTheDocument();
      expect(screen.getByText('Krytyczne wytyczne')).toBeInTheDocument();
    });

    it('should show skeleton loading state while data is loading', () => {
      jest.mocked(ruleAPI.getAll).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockRules as any), 100))
      );
      jest.mocked(hourLimitAPI.getAll).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockLimits as any), 100))
      );

      render(<RegulyTab />);
      // Check for skeleton elements - animated pulse divs in table
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('should show retry button on network error and successfully retry', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Network connection failed';
      jest.mocked(ruleAPI.getAll).mockRejectedValueOnce(new Error(errorMessage));
      jest.mocked(hourLimitAPI.getAll).mockRejectedValueOnce(new Error(errorMessage));

      render(<RegulyTab />);

      await waitFor(() => {
        // Text appears twice - once for each section (limits + rules)
        const errorTexts = screen.getAllByText('Nie udało się załadować danych. Spróbuj ponownie.');
        expect(errorTexts.length).toBeGreaterThan(0);
      });

      const retryButtons = screen.getAllByRole('button', { name: 'Spróbuj ponownie' });
      expect(retryButtons.length).toBeGreaterThan(0);

      jest.mocked(ruleAPI.getAll).mockResolvedValue(mockRules as any);
      jest.mocked(hourLimitAPI.getAll).mockResolvedValue(mockLimits as any);

      await user.click(retryButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Maksymalnie 8 godzin dziennie')).toBeInTheDocument();
        expect(screen.getByText('Limity godzin')).toBeInTheDocument();
      });
    });
  });
});
