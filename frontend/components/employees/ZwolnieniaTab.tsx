/**
 * ZwolnieniaTab component
 * Tab for displaying and managing sick leaves (typ=zwolnienie)
 * Implements User Story 3
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
import { SickLeaveForm } from './forms/SickLeaveForm';
import type { SickLeaveFormData } from '@/types/schemas';
import { calculateVacationDays, formatDateToPL } from '@/utils/dates';

/**
 * ZwolnieniaTab component
 */
export function ZwolnieniaTab(): JSX.Element {
  const [sickLeaves, setSickLeaves] = React.useState<Absence[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedSickLeave, setSelectedSickLeave] = React.useState<Absence | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Absence | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Load data on mount
  React.useEffect(() => {
    loadEmployees();
    loadSickLeaves();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees:', err);
      // Non-critical error, don't block the UI
    }
  };

  const loadSickLeaves = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch with typ_nieobecnosci=zwolnienie filter
      const data = await absenceAPI.getAll({ typ_nieobecnosci: 'zwolnienie' });
      setSickLeaves(data);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error loading sick leaves:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedSickLeave(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (sickLeave: Absence) => {
    setSelectedSickLeave(sickLeave);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (sickLeave: Absence) => {
    setDeleteConfirm(sickLeave);
  };

  const handleFormSubmit = async (data: SickLeaveFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      if (selectedSickLeave?.id) {
        // Update existing
        await absenceAPI.update(selectedSickLeave.id, data);
      } else {
        // Create new
        await absenceAPI.create(data);
      }

      // Reload sick leaves
      await loadSickLeaves();
      setIsFormOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error saving sick leave:', err);
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
      await loadSickLeaves();
      setDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error deleting sick leave:', err);
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

  // Loading state
  if (isLoading && sickLeaves.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Zwolnienia lekarskie</h2>
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
            {selectedSickLeave ? 'Edytuj zwolnienie' : 'Dodaj nowe zwolnienie'}
          </h2>
        </div>
        {error && <ErrorMessage message={error} />}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SickLeaveForm
            initialData={selectedSickLeave || undefined}
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
        <h2 className="text-xl font-semibold">Zwolnienia lekarskie</h2>
        <button
          onClick={handleAddClick}
          className="rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          + Dodaj zwolnienie
        </button>
      </div>

      {/* Error */}
      {error && <ErrorMessage message={error} />}

      {/* Sick Leave Table */}
      {sickLeaves.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            Brak zwolnień lekarskich w systemie
          </p>
        </div>
      ) : (
        <Table<Absence>
          data={sickLeaves}
          keyField="id"
          className="rounded-lg border border-gray-200 bg-white"
          emptyMessage="Brak zwolnień lekarskich w systemie"
          columns={[
            {
              key: 'pracownik',
              label: 'Pracownik',
              render: (sickLeave) => getEmployeeName(sickLeave.pracownik_id),
            },
            {
              key: 'data_od',
              label: 'Od',
              render: (sickLeave) => formatDateToPL(sickLeave.data_od),
            },
            {
              key: 'data_do',
              label: 'Do',
              render: (sickLeave) => formatDateToPL(sickLeave.data_do),
            },
            {
              key: 'liczba_dni',
              label: 'Liczba dni',
              className: 'text-center font-semibold',
              render: (sickLeave) => calculateVacationDays(sickLeave.data_od, sickLeave.data_do),
            },
            {
              key: 'notatki',
              label: 'Notatki',
              className: 'text-gray-600',
              render: (sickLeave) => sickLeave.notatki || '-',
            },
          ]}
          actions={{
            label: 'Akcje',
            render: (sickLeave) => (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEditClick(sickLeave)}
                  title="Edytuj zwolnienie"
                  className="text-orange-600 hover:text-orange-800 focus:outline-none"
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
                  onClick={() => handleDeleteClick(sickLeave)}
                  title="Usuń zwolnienie"
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
          message={`Czy na pewno chcesz usunąć zwolnienie dla ${getEmployeeName(deleteConfirm.pracownik_id)}?`}
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
