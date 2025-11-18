/**
 * EmployeesTab component
 * Main tab for displaying and managing all employees
 * Implements User Story 1
 */

import React from 'react';
import type { Employee } from '@/types';
import { employeeAPI, getErrorMessage } from '@/services/api';
import { Table, TableSkeleton, LoadingSpinner, ErrorMessage, ConfirmDialog } from '@/components/common';
import { EmployeeForm } from './forms/EmployeeForm';
import type { EmployeeFormData } from '@/lib/validation';

export interface EmployeesTabProps {
  /** Optional employee ID to focus on */
  focusId?: string;
}

/**
 * EmployeesTab component
 */
export function EmployeesTab({ focusId }: EmployeesTabProps): JSX.Element {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Employee | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Load employees
  React.useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await employeeAPI.getAll();
      // Sortuj alfabetycznie po nazwisku (polskie locale, case-insensitive)
      const sorted = [...data].sort((a, b) =>
        a.nazwisko.localeCompare(b.nazwisko, 'pl', { sensitivity: 'base' })
      );
      setEmployees(sorted);

      // Focus on specific employee if requested
      if (focusId) {
        const found = data.find((emp) => emp.id === focusId);
        if (found) {
          setSelectedEmployee(found);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error loading employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setDeleteConfirm(employee);
  };

  const handleFormSubmit = async (data: EmployeeFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      if (selectedEmployee?.id) {
        // Update existing
        await employeeAPI.update(selectedEmployee.id, data);
      } else {
        // Create new
        await employeeAPI.create(data);
      }

      // Reload employees
      await loadEmployees();
      setIsFormOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error saving employee:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm?.id) return;

    try {
      setIsSaving(true);
      setError(null);
      await employeeAPI.delete(deleteConfirm.id);
      await loadEmployees();
      setDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error deleting employee:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Aktywny':
        return 'bg-green-100 text-green-800';
      case 'Na urlopie':
        return 'bg-yellow-100 text-yellow-800';
      case 'Chorobowe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Wszyscy pracownicy</h2>
        <button
          onClick={handleAddClick}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Dodaj pracownika
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          title="Błąd"
          onDismiss={() => setError(null)}
          variant="error"
        />
      )}

      {/* Form */}
      {isFormOpen && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 font-semibold text-gray-900">
            {selectedEmployee ? 'Edytuj pracownika' : 'Dodaj nowego pracownika'}
          </h3>
          <EmployeeForm
            initialData={selectedEmployee || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isSaving}
          />
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <TableSkeleton columnCount={5} rowCount={5} />
      ) : (
        <Table<Employee & { lp: number }>
          data={employees.map((e, i) => ({ ...e, lp: i + 1 }))}
          columns={[
            {
              key: 'lp',
              label: 'Lp.',
              className: 'w-14',
            },
            {
              key: 'imie_nazwisko',
              label: 'Imię i nazwisko',
              render: (emp) => `${emp.imie} ${emp.nazwisko}`,
            },
            {
              key: 'stanowisko',
              label: 'Stanowisko',
            },
            {
              key: 'status',
              label: 'Status',
              render: (emp) => (
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(emp.status)}`}>
                  {emp.status}
                </span>
              ),
            },
            {
              key: 'etat',
              label: 'Etat',
              render: (emp) => `${emp.etat === 1.0 ? '100%' : emp.etat === 0.75 ? '75%' : emp.etat === 0.5 ? '50%' : '25%'}`,
            },
          ]}
          keyField="id"
          actions={{
            render: (emp) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(emp)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Edytuj pracownika"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDeleteClick(emp)}
                  className="text-red-600 hover:text-red-900"
                  title="Usuń pracownika"
                >
                  ✕
                </button>
              </div>
            ),
          }}
          emptyMessage="Brak pracowników w systemie"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć pracownika ${deleteConfirm?.imie} ${deleteConfirm?.nazwisko}? Tej akcji nie można cofnąć.`}
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={isSaving}
      />
    </div>
  );
}
