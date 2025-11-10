/**
 * Unit tests for ZwolnieniaTab component
 * Tests User Story 3 functionality
 */

import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ZwolnieniaTab } from '@/components/employees/ZwolnieniaTab';
import { absenceAPI, employeeAPI } from '@/services/api';
import type { Absence, Employee } from '@/types';

// Mock the APIs
vi.mock('@/services/api', () => ({
  absenceAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  employeeAPI: {
    getAll: vi.fn(),
  },
  getErrorMessage: vi.fn((err) => err.message || 'Unknown error'),
}));

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
  {
    id: '2',
    imie: 'Anna',
    nazwisko: 'Nowak',
    stanowisko: 'SSK',
    status: 'Aktywny',
    etat: 0.75,
    utworzono: '2024-01-01T00:00:00Z',
    zaktualizowano: '2024-01-01T00:00:00Z',
  },
];

const mockSickLeaves: Absence[] = [
  {
    id: '1',
    pracownik_id: 1,
    data_od: '2024-01-10',
    data_do: '2024-01-15',
    typ_nieobecnosci: 'zwolnienie',
    notatki: 'Grypa',
    utworzono: '2024-01-09T00:00:00Z',
    zaktualizowano: '2024-01-09T00:00:00Z',
  },
  {
    id: '2',
    pracownik_id: 2,
    data_od: '2024-02-01',
    data_do: '2024-02-03',
    typ_nieobecnosci: 'zwolnienie',
    notatki: null,
    utworzono: '2024-01-31T00:00:00Z',
    zaktualizowano: '2024-01-31T00:00:00Z',
  },
];

describe('ZwolnieniaTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sick Leave List Loading', () => {
    it('should load and display sick leaves on mount with typ=zwolnienie filter', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);

      render(<ZwolnieniaTab />);

      // Should show loading state initially
      expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();

      // Wait for sick leaves to load
      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalledWith({ typ: 'zwolnienie' });
        expect(employeeAPI.getAll).toHaveBeenCalledTimes(1);
      });

      // Should display employee names
      expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
      expect(screen.getByText('Anna Nowak')).toBeInTheDocument();
    });

    it('should display error message if loading fails', async () => {
      const errorMessage = 'Failed to load sick leaves';
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockRejectedValue(new Error(errorMessage));

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display empty message when no sick leaves', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue([]);

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(screen.getByText('Brak zwolnień lekarskich w systemie')).toBeInTheDocument();
      });
    });
  });

  describe('Sick Leave Table Display', () => {
    it('should display sick leave table with all columns', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalled();
      });

      // Check table headers
      expect(screen.getByText('Pracownik')).toBeInTheDocument();
      expect(screen.getByText('Od')).toBeInTheDocument();
      expect(screen.getByText('Do')).toBeInTheDocument();
      expect(screen.getByText('Liczba dni')).toBeInTheDocument();
      expect(screen.getByText('Notatki')).toBeInTheDocument();
      expect(screen.getByText('Akcje')).toBeInTheDocument();
    });

    it('should calculate and display number of days', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalled();
      });

      // First sick leave: 2024-01-10 to 2024-01-15 = 6 days
      // Second sick leave: 2024-02-01 to 2024-02-03 = 3 days
      const dayCounts = screen.getAllByText(/^\d+$/);
      expect(dayCounts.some((el) => el.textContent === '6')).toBe(true);
      expect(dayCounts.some((el) => el.textContent === '3')).toBe(true);
    });

    it('should display notes or dash if empty', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalled();
      });

      expect(screen.getByText('Grypa')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument(); // Empty notes
    });
  });

  describe('Add Sick Leave', () => {
    it('should open form when add button is clicked', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalled();
      });

      const addButton = screen.getByText('+ Dodaj zwolnienie');
      fireEvent.click(addButton);

      expect(screen.getByText('Dodaj nowe zwolnienie')).toBeInTheDocument();
    });

    it('should call API when form is submitted', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);
      vi.mocked(absenceAPI.create).mockResolvedValue({
        ...mockSickLeaves[0],
        id: '3',
        pracownik_id: 1,
        data_od: '2024-03-01',
        data_do: '2024-03-05',
        notatki: 'Test zwolnienie',
      });

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalled();
      });

      // Open form
      const addButton = screen.getByText('+ Dodaj zwolnienie');
      fireEvent.click(addButton);

      // Fill form
      fireEvent.change(screen.getByLabelText(/Pracownik/), {
        target: { value: '1' },
      });
      fireEvent.change(screen.getByLabelText(/Data rozpoczęcia/), {
        target: { value: '2024-03-01' },
      });
      fireEvent.change(screen.getByLabelText(/Data zakończenia/), {
        target: { value: '2024-03-05' },
      });
      fireEvent.change(screen.getByLabelText(/Notatki/), {
        target: { value: 'Test zwolnienie' },
      });

      // Submit
      const submitButton = screen.getByText('Dodaj zwolnienie');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(absenceAPI.create).toHaveBeenCalledWith(
          expect.objectContaining({
            pracownik_id: 1,
            data_od: '2024-03-01',
            data_do: '2024-03-05',
            typ_nieobecnosci: 'zwolnienie',
            notatki: 'Test zwolnienie',
          })
        );
      });
    });
  });

  describe('Edit Sick Leave', () => {
    it('should open form with sick leave data when edit is clicked', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalled();
      });

      // Click edit button (first edit icon)
      const editButtons = screen.getAllByTitle('Edytuj zwolnienie');
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('Edytuj zwolnienie')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-01-10')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Grypa')).toBeInTheDocument();
    });

    it('should call API when edit form is submitted', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);
      vi.mocked(absenceAPI.update).mockResolvedValue({
        ...mockSickLeaves[0],
        data_do: '2024-01-20',
        notatki: 'Grypa - przedłużone',
      });

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalled();
      });

      // Click edit
      const editButtons = screen.getAllByTitle('Edytuj zwolnienie');
      fireEvent.click(editButtons[0]);

      // Update end date and notes
      const dataDoInput = screen.getByDisplayValue('2024-01-15');
      fireEvent.change(dataDoInput, { target: { value: '2024-01-20' } });

      const notatkiInput = screen.getByDisplayValue('Grypa');
      fireEvent.change(notatkiInput, { target: { value: 'Grypa - przedłużone' } });

      // Submit
      const submitButton = screen.getByText('Zapisz zmiany');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(absenceAPI.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            data_do: '2024-01-20',
            notatki: 'Grypa - przedłużone',
          })
        );
      });
    });
  });

  describe('Delete Sick Leave', () => {
    it('should show confirmation dialog when delete is clicked', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalled();
      });

      // Click delete button
      const deleteButtons = screen.getAllByTitle('Usuń zwolnienie');
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText('Potwierdź usunięcie')).toBeInTheDocument();
      expect(screen.getByText(/Jan Kowalski/)).toBeInTheDocument();
    });

    it('should call API when deletion is confirmed', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);
      vi.mocked(absenceAPI.delete).mockResolvedValue();

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalled();
      });

      // Click delete
      const deleteButtons = screen.getAllByTitle('Usuń zwolnienie');
      fireEvent.click(deleteButtons[0]);

      // Confirm
      const confirmButton = screen.getByText('Usuń');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(absenceAPI.delete).toHaveBeenCalledWith('1');
      });
    });

    it('should not delete when canceled', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalled();
      });

      // Click delete
      const deleteButtons = screen.getAllByTitle('Usuń zwolnienie');
      fireEvent.click(deleteButtons[0]);

      // Cancel
      const cancelButton = screen.getByText('Anuluj');
      fireEvent.click(cancelButton);

      expect(absenceAPI.delete).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalled();
      });

      // Open form
      const addButton = screen.getByText('+ Dodaj zwolnienie');
      fireEvent.click(addButton);

      // Submit empty form
      const submitButton = screen.getByText('Dodaj zwolnienie');
      fireEvent.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/Wybierz pracownika/)).toBeInTheDocument();
        expect(screen.getByText(/Data rozpoczęcia jest wymagana/)).toBeInTheDocument();
        expect(screen.getByText(/Data zakończenia jest wymagana/)).toBeInTheDocument();
      });

      // Should not call API
      expect(absenceAPI.create).not.toHaveBeenCalled();
    });

    it('should validate date range (end date >= start date)', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(absenceAPI.getAll).mockResolvedValue(mockSickLeaves);

      render(<ZwolnieniaTab />);

      await waitFor(() => {
        expect(absenceAPI.getAll).toHaveBeenCalled();
      });

      // Open form
      const addButton = screen.getByText('+ Dodaj zwolnienie');
      fireEvent.click(addButton);

      // Fill with invalid date range
      fireEvent.change(screen.getByLabelText(/Pracownik/), {
        target: { value: '1' },
      });
      fireEvent.change(screen.getByLabelText(/Data rozpoczęcia/), {
        target: { value: '2024-03-10' },
      });
      fireEvent.change(screen.getByLabelText(/Data zakończenia/), {
        target: { value: '2024-03-05' }, // Earlier than start date
      });

      // Submit
      const submitButton = screen.getByText('Dodaj zwolnienie');
      fireEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(
          screen.getByText(/Data zakończenia musi być późniejsza lub równa dacie rozpoczęcia/)
        ).toBeInTheDocument();
      });

      // Should not call API
      expect(absenceAPI.create).not.toHaveBeenCalled();
    });
  });
});
