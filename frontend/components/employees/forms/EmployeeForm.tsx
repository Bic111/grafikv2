/**
 * EmployeeForm component
 * Form for creating or editing employee records
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Employee } from '@/types';
import { employeeSchema, type EmployeeFormData, getFieldError } from '@/lib/validation';

const POSITIONS = ['Kierownik', 'Z-ca kierownika', 'SSK', 'Kasjer'] as const;
const STATUSES = ['Aktywny', 'Na urlopie', 'Chorobowe'] as const;
const ETATS = [1.0, 0.75, 0.5, 0.25] as const;

export interface EmployeeFormProps {
  /** Employee data to edit (if any) */
  initialData?: Employee;
  /** Callback when form is submitted */
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  /** Callback when form is canceled */
  onCancel?: () => void;
  /** Whether the form is loading */
  isLoading?: boolean;
  /** Submit button label */
  submitLabel?: string;
}

/**
 * EmployeeForm component
 */
export function EmployeeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = initialData ? 'Zapisz zmiany' : 'Dodaj pracownika',
}: EmployeeFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData || {
      imie: '',
      nazwisko: '',
      stanowisko: 'Kasjer',
      status: 'Aktywny',
      etat: 1.0,
    },
  });

  // Gdy przechodzimy z trybu dodawania do edycji (lub zmienia się wybrany pracownik),
  // musimy zresetować wartości formularza – react-hook-form nie aktualizuje defaultValues po pierwszym renderze.
  React.useEffect(() => {
    if (initialData) {
      // Zachowujemy pełne dane obiektu, aby wszystkie pola (w tym stanowisko) poprawnie się uzupełniły.
      reset({
        id: initialData.id,
        imie: initialData.imie,
        nazwisko: initialData.nazwisko,
        stanowisko: initialData.stanowisko,
        status: initialData.status,
        etat: initialData.etat,
        utworzono: initialData.utworzono,
        zaktualizowano: initialData.zaktualizowano,
      });
    }
  }, [initialData, reset]);

  const isProcessing = isSubmitting || isLoading;

  const handleFormSubmit = async (data: EmployeeFormData) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        reset();
      }
    } catch (error) {
      console.error('Błąd przy zapisywaniu pracownika:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Imię */}
      <div>
        <label htmlFor="imie" className="block text-sm font-medium text-gray-700">
          Imię <span className="text-red-500">*</span>
        </label>
        <input
          {...register('imie')}
          id="imie"
          type="text"
          placeholder="np. Jan"
          disabled={isProcessing}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
        />
        {errors.imie && (
          <p className="mt-1 text-xs text-red-600">{getFieldError(errors, 'imie')}</p>
        )}
      </div>

      {/* Nazwisko */}
      <div>
        <label htmlFor="nazwisko" className="block text-sm font-medium text-gray-700">
          Nazwisko <span className="text-red-500">*</span>
        </label>
        <input
          {...register('nazwisko')}
          id="nazwisko"
          type="text"
          placeholder="np. Kowalski"
          disabled={isProcessing}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
        />
        {errors.nazwisko && (
          <p className="mt-1 text-xs text-red-600">{getFieldError(errors, 'nazwisko')}</p>
        )}
      </div>

      {/* Stanowisko */}
      <div>
        <label htmlFor="stanowisko" className="block text-sm font-medium text-gray-700">
          Stanowisko <span className="text-red-500">*</span>
        </label>
        <select
          {...register('stanowisko')}
          id="stanowisko"
          disabled={isProcessing}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
        >
          {POSITIONS.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
        {errors.stanowisko && (
          <p className="mt-1 text-xs text-red-600">{getFieldError(errors, 'stanowisko')}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          {...register('status')}
          id="status"
          disabled={isProcessing}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="mt-1 text-xs text-red-600">{getFieldError(errors, 'status')}</p>
        )}
      </div>

      {/* Etat */}
      <div>
        <label htmlFor="etat" className="block text-sm font-medium text-gray-700">
          Etat <span className="text-red-500">*</span>
        </label>
        <select
          {...register('etat', { valueAsNumber: true })}
          id="etat"
          disabled={isProcessing}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
        >
          {ETATS.map((etat) => (
            <option key={etat} value={etat}>
              {etat === 1.0 ? '100%' : etat === 0.75 ? '75%' : etat === 0.5 ? '50%' : '25%'}
            </option>
          ))}
        </select>
        {errors.etat && (
          <p className="mt-1 text-xs text-red-600">{getFieldError(errors, 'etat')}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isProcessing}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isProcessing ? 'Zapisywanie...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Anuluj
          </button>
        )}
      </div>
    </form>
  );
}
