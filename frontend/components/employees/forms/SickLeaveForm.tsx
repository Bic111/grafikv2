/**
 * SickLeaveForm component
 * Form for creating or editing sick leave records (typ=zwolnienie)
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Absence, Employee } from '@/types';
import { sickLeaveFormSchema, type SickLeaveFormData } from '@/types/schemas';
import { calculateVacationDays, formatDateToISO } from '@/utils/dates';

export interface SickLeaveFormProps {
  /** Sick leave data to edit (if any) */
  initialData?: Absence;
  /** List of employees for dropdown */
  employees: Employee[];
  /** Callback when form is submitted */
  onSubmit: (data: SickLeaveFormData) => Promise<void>;
  /** Callback when form is canceled */
  onCancel?: () => void;
  /** Whether the form is loading */
  isLoading?: boolean;
  /** Submit button label */
  submitLabel?: string;
}

/**
 * SickLeaveForm component
 */
export function SickLeaveForm({
  initialData,
  employees,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = initialData ? 'Zapisz zmiany' : 'Dodaj zwolnienie',
}: SickLeaveFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<SickLeaveFormData>({
    resolver: zodResolver(sickLeaveFormSchema),
    defaultValues: initialData
      ? {
          pracownik_id: initialData.pracownik_id,
          data_od: formatDateToISO(initialData.data_od),
          data_do: formatDateToISO(initialData.data_do),
          typ_nieobecnosci: 'zwolnienie',
          notatki: initialData.notatki || '',
        }
      : {
          pracownik_id: 0,
          data_od: '',
          data_do: '',
          typ_nieobecnosci: 'zwolnienie',
          notatki: '',
        },
  });

  const isProcessing = isSubmitting || isLoading;
  const dataOd = watch('data_od');
  const dataDo = watch('data_do');

  // Calculate sick leave days dynamically
  const sickLeaveDays =
    dataOd && dataDo ? calculateVacationDays(dataOd, dataDo) : 0;

  const handleFormSubmit = async (data: SickLeaveFormData) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        reset();
      }
    } catch (error) {
      console.error('Błąd przy zapisywaniu zwolnienia:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Pracownik */}
      <div>
        <label
          htmlFor="pracownik_id"
          className="block text-sm font-medium text-gray-700"
        >
          Pracownik <span className="text-red-500">*</span>
        </label>
        <select
          {...register('pracownik_id', { valueAsNumber: true })}
          id="pracownik_id"
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.pracownik_id
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300'
          } ${isProcessing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        >
          <option value={0}>-- Wybierz pracownika --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={Number(emp.id)}>
              {emp.imie} {emp.nazwisko}
            </option>
          ))}
        </select>
        {errors.pracownik_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.pracownik_id.message}
          </p>
        )}
      </div>

      {/* Data od */}
      <div>
        <label
          htmlFor="data_od"
          className="block text-sm font-medium text-gray-700"
        >
          Data rozpoczęcia <span className="text-red-500">*</span>
        </label>
        <input
          {...register('data_od')}
          id="data_od"
          type="date"
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.data_od
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300'
          } ${isProcessing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {errors.data_od && (
          <p className="mt-1 text-sm text-red-600">{errors.data_od.message}</p>
        )}
      </div>

      {/* Data do */}
      <div>
        <label
          htmlFor="data_do"
          className="block text-sm font-medium text-gray-700"
        >
          Data zakończenia <span className="text-red-500">*</span>
        </label>
        <input
          {...register('data_do')}
          id="data_do"
          type="date"
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.data_do
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300'
          } ${isProcessing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {errors.data_do && (
          <p className="mt-1 text-sm text-red-600">{errors.data_do.message}</p>
        )}
      </div>

      {/* Sick leave days display */}
      {dataOd && dataDo && sickLeaveDays > 0 && (
        <div className="rounded-md bg-orange-50 p-3">
          <p className="text-sm text-orange-900">
            <span className="font-medium">Liczba dni zwolnienia:</span>{' '}
            <span className="text-lg font-bold">{sickLeaveDays}</span>
          </p>
        </div>
      )}

      {/* Notatki (optional) */}
      <div>
        <label
          htmlFor="notatki"
          className="block text-sm font-medium text-gray-700"
        >
          Notatki
        </label>
        <textarea
          {...register('notatki')}
          id="notatki"
          rows={3}
          placeholder="Dodatkowe informacje (opcjonalne)"
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.notatki
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300'
          } ${isProcessing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {errors.notatki && (
          <p className="mt-1 text-sm text-red-600">{errors.notatki.message}</p>
        )}
      </div>

      {/* Hidden field for typ_nieobecnosci */}
      <input
        type="hidden"
        {...register('typ_nieobecnosci')}
        value="zwolnienie"
      />

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isProcessing}
          className="rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Zapisywanie...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed"
          >
            Anuluj
          </button>
        )}
      </div>
    </form>
  );
}
