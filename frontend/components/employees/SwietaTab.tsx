import React from 'react';
import type { Holiday } from '@/types';
import { holidayAPI, getErrorMessage } from '@/services/api';
import { Table, TableSkeleton, ErrorMessage, ConfirmDialog, type TableSortState } from '@/components/common';
import { HolidayForm } from './forms/HolidayForm';
import type { HolidayFormData } from '@/types/schemas';
import { formatDateToPL } from '@/utils/dates';

function sortHolidays(data: Holiday[], sortState: TableSortState): Holiday[] {
  const sorted = [...data];

  sorted.sort((a, b) => {
    const { columnKey, direction } = sortState;
    const orderMultiplier = direction === 'asc' ? 1 : -1;

    if (columnKey === 'data') {
      const dateA = new Date(a.data).getTime();
      const dateB = new Date(b.data).getTime();
      return (dateA - dateB) * orderMultiplier;
    }

    const valueA = String(a[columnKey as keyof Holiday] ?? '').toLocaleLowerCase();
    const valueB = String(b[columnKey as keyof Holiday] ?? '').toLocaleLowerCase();

    return valueA.localeCompare(valueB, 'pl') * orderMultiplier;
  });

  return sorted;
}

export function SwietaTab(): JSX.Element {
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedHoliday, setSelectedHoliday] = React.useState<Holiday | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Holiday | null>(null);
  const [sortState, setSortState] = React.useState<TableSortState>({
    columnKey: 'data',
    direction: 'desc',
  });

  React.useEffect(() => {
    void loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await holidayAPI.getAll();
      setHolidays(data);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error loading holidays:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedHoliday(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (holiday: Holiday) => {
    setDeleteConfirm(holiday);
  };

  const handleFormSubmit = async (data: HolidayFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        data: data.data,
        nazwa: data.nazwa,
        store_closed: data.store_closed,
        ...(data.opis ? { opis: data.opis } : {}),
      };

      if (selectedHoliday?.id) {
        await holidayAPI.update(selectedHoliday.id, payload);
      } else {
        await holidayAPI.create(payload);
      }

      await loadHolidays();
      setIsFormOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error saving holiday:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm?.id) return;

    try {
      setError(null);
      setIsSaving(true);
      await holidayAPI.delete(deleteConfirm.id);
      await loadHolidays();
      setDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error deleting holiday:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const visibleHolidays = React.useMemo(
    () => sortHolidays(holidays, sortState),
    [holidays, sortState]
  );

  const handleSort = (columnKey: string, direction: 'asc' | 'desc') => {
    setSortState({ columnKey, direction });
  };

  if (isLoading && holidays.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Święta</h2>
        </div>
        <TableSkeleton columnCount={3} />
      </div>
    );
  }

  if (isFormOpen) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {selectedHoliday ? 'Edytuj święto' : 'Dodaj święto'}
          </h2>
        </div>
        {error && <ErrorMessage message={error} />}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <HolidayForm
            initialData={selectedHoliday ?? undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isSaving}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Święta</h2>
        <button
          onClick={handleAddClick}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + Dodaj święto
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="rounded-lg border border-gray-200 bg-white">
        <Table<Holiday>
          data={visibleHolidays}
          keyField="id"
          className="rounded-lg"
          emptyMessage="Brak zdefiniowanych świąt"
          sortState={sortState}
          onSort={handleSort}
          columns={[
            {
              key: 'data',
              label: 'Data',
              sortable: true,
              render: (holiday) => formatDateToPL(holiday.data),
            },
            {
              key: 'nazwa',
              label: 'Nazwa',
              sortable: true,
            },
            {
              key: 'opis',
              label: 'Opis',
              sortable: true,
              render: (holiday) => (
                <span className="block max-w-xl truncate" title={holiday.opis || ''}>
                  {holiday.opis || '—'}
                  {holiday.store_closed ? ' • Sklep zamknięty' : ''}
                </span>
              ),
            },
          ]}
          actions={{
            render: (holiday) => (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEditClick(holiday)}
                  title="Edytuj święto"
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
                  onClick={() => handleDeleteClick(holiday)}
                  title="Usuń święto"
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
      </div>

      {deleteConfirm && (
        <ConfirmDialog
          title="Potwierdź usunięcie"
          message={`Czy na pewno chcesz usunąć święto "${deleteConfirm.nazwa}"?`}
          confirmLabel="Usuń"
          cancelLabel="Anuluj"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          variant="danger"
        />
      )}
    </div>
  );
}
