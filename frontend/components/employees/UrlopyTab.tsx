/**
 * UrlopyTab component
 * Tab for displaying and managing employee vacations (typ=urlop)
 * Implements User Story 2
 */

import React from 'react';
import type { Absence, Employee } from '@/types';
import { absenceAPI, employeeAPI, getErrorMessage } from '@/services/api';
import {
  Table,
  TableSkeleton,
  ErrorMessage,
  ConfirmDialog,
} from '@/components/common';
import { VacationForm } from './forms/VacationForm';
import type { VacationFormData } from '@/types/schemas';
import { calculateVacationDays, formatDateToPL, getCurrentYear } from '@/utils/dates';

/**
 * UrlopyTab component
 */
export function UrlopyTab(): JSX.Element {
  const [vacations, setVacations] = React.useState<Absence[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedVacation, setSelectedVacation] = React.useState<Absence | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Absence | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Filter states
  const [filterYear, setFilterYear] = React.useState<number>(getCurrentYear());
  const [filterMonth, setFilterMonth] = React.useState<number | null>(null);

  // Load data on mount
  React.useEffect(() => {
    loadEmployees();
    loadVacations();
  }, [filterYear, filterMonth]);

  const loadEmployees = async () => {
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees:', err);
      // Non-critical error, don't block the UI
    }
  };

  const loadVacations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch with typ_nieobecnosci=urlop filter
      const data = await absenceAPI.getAll({ typ_nieobecnosci: 'urlop' });

      // Apply year/month filters client-side
      const filtered = data.filter((vacation) => {
        const startDate = new Date(vacation.data_od);
        const yearMatch = startDate.getFullYear() === filterYear;
        const monthMatch =
          filterMonth === null || startDate.getMonth() + 1 === filterMonth;
        return yearMatch && monthMatch;
      });

      setVacations(filtered);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error loading vacations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedVacation(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (vacation: Absence) => {
    setSelectedVacation(vacation);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (vacation: Absence) => {
    setDeleteConfirm(vacation);
  };

  const handleFormSubmit = async (data: VacationFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      if (selectedVacation?.id) {
        // Update existing
        await absenceAPI.update(selectedVacation.id, data);
      } else {
        // Create new
        await absenceAPI.create(data);
      }

      // Reload vacations
      await loadVacations();
      setIsFormOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error saving vacation:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm?.id) return;

    try {
      setError(null);
      await absenceAPI.delete(deleteConfirm.id);
      await loadVacations();
      setDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error deleting vacation:', err);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Get employee name by ID
  const getEmployeeName = (pracownikId: number): string => {
    const emp = employees.find((e) => e.id === pracownikId);
    return emp ? `${emp.imie} ${emp.nazwisko}` : `ID: ${pracownikId}`;
  };

  // Generate year options (current year ± 2)
  const yearOptions = Array.from({ length: 5 }, (_, i) => getCurrentYear() - 2 + i);

  // Month names in Polish
  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
  ];

  // Loading state
  if (isLoading && vacations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Urlopy</h2>
        </div>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  // Form view
  if (isFormOpen) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {selectedVacation ? 'Edytuj urlop' : 'Dodaj nowy urlop'}
          </h2>
        </div>
        {error && <ErrorMessage message={error} />}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <VacationForm
            initialData={selectedVacation || undefined}
            employees={employees}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isSaving}
          />
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Urlopy</h2>
        <button
          onClick={handleAddClick}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + Dodaj urlop
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label htmlFor="filter-year" className="block text-sm font-medium text-gray-700">
            Rok
          </label>
          <select
            id="filter-year"
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-month" className="block text-sm font-medium text-gray-700">
            Miesiąc
          </label>
          <select
            id="filter-month"
            value={filterMonth || ''}
            onChange={(e) =>
              setFilterMonth(e.target.value ? Number(e.target.value) : null)
            }
            className="mt-1 block w-40 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Wszystkie</option>
            {monthNames.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && <ErrorMessage message={error} />}

      {/* Vacation Table */}
      {vacations.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            Brak urlopów w wybranym okresie
          </p>
        </div>
      ) : (
        <Table<Absence>
          data={vacations}
          keyField="id"
          className="rounded-lg border border-gray-200 bg-white"
          emptyMessage="Brak urlopów w wybranym okresie"
          columns={[
            {
              key: 'pracownik',
              label: 'Pracownik',
              render: (vacation) => getEmployeeName(vacation.pracownik_id),
            },
            {
              key: 'data_od',
              label: 'Od',
              render: (vacation) => formatDateToPL(vacation.data_od),
            },
            {
              key: 'data_do',
              label: 'Do',
              render: (vacation) => formatDateToPL(vacation.data_do),
            },
            {
              key: 'liczba_dni',
              label: 'Liczba dni',
              className: 'text-center font-semibold',
              render: (vacation) => calculateVacationDays(vacation.data_od, vacation.data_do),
            },
          ]}
          actions={{
            label: 'Akcje',
            render: (vacation) => (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEditClick(vacation)}
                  title="Edytuj urlop"
                  className="text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path
                      fillRule="evenodd"
                      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteClick(vacation)}
                  title="Usuń urlop"
                  className="text-red-600 hover:text-red-800 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ),
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          title="Potwierdź usunięcie"
          message={`Czy na pewno chcesz usunąć urlop dla ${getEmployeeName(deleteConfirm.pracownik_id)}?`}
          confirmLabel="Usuń"
          cancelLabel="Anuluj"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDestructive={true}
        />
      )}
    </div>
  );
}
