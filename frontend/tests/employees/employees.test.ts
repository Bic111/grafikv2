/**
 * Unit tests for EmployeesTab component
 * Tests User Story 1 functionality
 */

import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { EmployeesTab } from '@/components/employees/EmployeesTab';
import { employeeAPI } from '@/services/api';
import type { Employee } from '@/types';

// Mock the API
vi.mock('@/services/api', () => ({
  employeeAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

describe('EmployeesTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Employee List Loading', () => {
    it('should load and display employees on mount', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);

      render(<EmployeesTab />);

      // Should show loading state initially
      expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();

      // Wait for employees to load
      await waitFor(() => {
        expect(employeeAPI.getAll).toHaveBeenCalledTimes(1);
      });

      // Should display employee names
      expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
      expect(screen.getByText('Anna Nowak')).toBeInTheDocument();
    });

    it('should display error message if loading fails', async () => {
      const errorMessage = 'Failed to load employees';
      vi.mocked(employeeAPI.getAll).mockRejectedValue(new Error(errorMessage));

      render(<EmployeesTab />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display empty message when no employees', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue([]);

      render(<EmployeesTab />);

      await waitFor(() => {
        expect(screen.getByText('Brak pracowników w systemie')).toBeInTheDocument();
      });
    });
  });

  describe('Add Employee', () => {
    it('should open form when add button is clicked', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);

      render(<EmployeesTab />);

      await waitFor(() => {
        expect(employeeAPI.getAll).toHaveBeenCalled();
      });

      const addButton = screen.getByText('+ Dodaj pracownika');
      fireEvent.click(addButton);

      expect(screen.getByText('Dodaj nowego pracownika')).toBeInTheDocument();
    });

    it('should call API when form is submitted', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(employeeAPI.create).mockResolvedValue({
        ...mockEmployees[0],
        id: '3',
        imie: 'Piotr',
        nazwisko: 'Wiśniewski',
      });

      render(<EmployeesTab />);

      await waitFor(() => {
        expect(employeeAPI.getAll).toHaveBeenCalled();
      });

      // Open form
      const addButton = screen.getByText('+ Dodaj pracownika');
      fireEvent.click(addButton);

      // Fill form
      fireEvent.change(screen.getByLabelText(/Imię/), {
        target: { value: 'Piotr' },
      });
      fireEvent.change(screen.getByLabelText(/Nazwisko/), {
        target: { value: 'Wiśniewski' },
      });

      // Submit
      const submitButton = screen.getByText('Dodaj pracownika');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(employeeAPI.create).toHaveBeenCalledWith(
          expect.objectContaining({
            imie: 'Piotr',
            nazwisko: 'Wiśniewski',
          })
        );
      });
    });
  });

  describe('Edit Employee', () => {
    it('should open form with employee data when edit is clicked', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);

      render(<EmployeesTab />);

      await waitFor(() => {
        expect(employeeAPI.getAll).toHaveBeenCalled();
      });

      // Click edit button (first edit icon)
      const editButtons = screen.getAllByTitle('Edytuj pracownika');
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('Edytuj pracownika')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Jan')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Kowalski')).toBeInTheDocument();
    });

    it('should call API when edit form is submitted', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(employeeAPI.update).mockResolvedValue({
        ...mockEmployees[0],
        imie: 'Jan Updated',
      });

      render(<EmployeesTab />);

      await waitFor(() => {
        expect(employeeAPI.getAll).toHaveBeenCalled();
      });

      // Click edit
      const editButtons = screen.getAllByTitle('Edytuj pracownika');
      fireEvent.click(editButtons[0]);

      // Update name
      const imieInput = screen.getByDisplayValue('Jan');
      fireEvent.change(imieInput, { target: { value: 'Jan Updated' } });

      // Submit
      const submitButton = screen.getByText('Zapisz zmiany');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(employeeAPI.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            imie: 'Jan Updated',
          })
        );
      });
    });
  });

  describe('Delete Employee', () => {
    it('should show confirmation dialog when delete is clicked', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);

      render(<EmployeesTab />);

      await waitFor(() => {
        expect(employeeAPI.getAll).toHaveBeenCalled();
      });

      // Click delete button
      const deleteButtons = screen.getAllByTitle('Usuń pracownika');
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText('Potwierdź usunięcie')).toBeInTheDocument();
      expect(screen.getByText(/Jan Kowalski/)).toBeInTheDocument();
    });

    it('should call API when deletion is confirmed', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);
      vi.mocked(employeeAPI.delete).mockResolvedValue();

      render(<EmployeesTab />);

      await waitFor(() => {
        expect(employeeAPI.getAll).toHaveBeenCalled();
      });

      // Click delete
      const deleteButtons = screen.getAllByTitle('Usuń pracownika');
      fireEvent.click(deleteButtons[0]);

      // Confirm
      const confirmButton = screen.getByText('Usuń');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(employeeAPI.delete).toHaveBeenCalledWith('1');
      });
    });

    it('should not delete when canceled', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);

      render(<EmployeesTab />);

      await waitFor(() => {
        expect(employeeAPI.getAll).toHaveBeenCalled();
      });

      // Click delete
      const deleteButtons = screen.getAllByTitle('Usuń pracownika');
      fireEvent.click(deleteButtons[0]);

      // Cancel
      const cancelButton = screen.getByText('Anuluj');
      fireEvent.click(cancelButton);

      expect(employeeAPI.delete).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);

      render(<EmployeesTab />);

      await waitFor(() => {
        expect(employeeAPI.getAll).toHaveBeenCalled();
      });

      // Open form
      const addButton = screen.getByText('+ Dodaj pracownika');
      fireEvent.click(addButton);

      // Submit empty form
      const submitButton = screen.getByText('Dodaj pracownika');
      fireEvent.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/Imię jest wymagane/)).toBeInTheDocument();
        expect(screen.getByText(/Nazwisko jest wymagane/)).toBeInTheDocument();
      });

      // Should not call API
      expect(employeeAPI.create).not.toHaveBeenCalled();
    });
  });

  describe('Display Formatting', () => {
    it('should display status badges with correct colors', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);

      render(<EmployeesTab />);

      await waitFor(() => {
        expect(employeeAPI.getAll).toHaveBeenCalled();
      });

      const statusBadges = screen.getAllByText('Aktywny');
      expect(statusBadges.length).toBeGreaterThan(0);
      expect(statusBadges[0]).toHaveClass('bg-green-100');
    });

    it('should format etat as percentage', async () => {
      vi.mocked(employeeAPI.getAll).mockResolvedValue(mockEmployees);

      render(<EmployeesTab />);

      await waitFor(() => {
        expect(employeeAPI.getAll).toHaveBeenCalled();
      });

      expect(screen.getByText('100%')).toBeInTheDocument(); // 1.0
      expect(screen.getByText('75%')).toBeInTheDocument(); // 0.75
    });
  });
});
