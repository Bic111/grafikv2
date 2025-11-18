import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Holiday } from '@/types';
import { holidayFormSchema, type HolidayFormData } from '@/types/schemas';
import { formatDateToISO } from '@/utils/dates';

export interface HolidayFormProps {
  initialData?: Holiday;
  onSubmit: (data: HolidayFormData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function HolidayForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = initialData ? 'Zapisz zmiany' : 'Dodaj święto',
}: HolidayFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<HolidayFormData>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: initialData
      ? {
          data: formatDateToISO(initialData.data),
          nazwa: initialData.nazwa,
          opis: initialData.opis,
          store_closed: initialData.store_closed ?? false,
        }
      : {
          data: '',
          nazwa: '',
          opis: undefined,
          store_closed: false,
        },
  });

  const isProcessing = isSubmitting || isLoading;

  const handleFormSubmit = async (formData: HolidayFormData) => {
    const payload: HolidayFormData = {
      ...formData,
      opis: formData.opis?.trim() ? formData.opis.trim() : undefined,
    };

    try {
      await onSubmit(payload);

      if (!initialData) {
        reset({ data: '', nazwa: '', opis: undefined, store_closed: false });
      }
    } catch (error) {
      console.error('Błąd przy zapisywaniu święta:', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="holiday-date" className="block text-sm font-medium text-gray-700">
          Data <span className="text-red-500">*</span>
        </label>
        <input
          id="holiday-date"
          type="date"
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.data ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          } ${isProcessing ? 'cursor-not-allowed bg-gray-100' : 'bg-white'}`}
          {...register('data')}
        />
        {errors.data && (
          <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="holiday-name" className="block text-sm font-medium text-gray-700">
          Nazwa <span className="text-red-500">*</span>
        </label>
        <input
          id="holiday-name"
          type="text"
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.nazwa ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          } ${isProcessing ? 'cursor-not-allowed bg-gray-100' : 'bg-white'}`}
          {...register('nazwa', {
            setValueAs: (value: string) => value?.trim() ?? '',
          })}
        />
        {errors.nazwa && (
          <p className="mt-1 text-sm text-red-600">{errors.nazwa.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="holiday-description" className="block text-sm font-medium text-gray-700">
          Opis (opcjonalnie)
        </label>
        <textarea
          id="holiday-description"
          rows={3}
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.opis ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          } ${isProcessing ? 'cursor-not-allowed bg-gray-100' : 'bg-white'}`}
          {...register('opis', {
            setValueAs: (value: string) => {
              const normalized = value?.trim() ?? '';
              return normalized === '' ? undefined : normalized;
            },
          })}
        />
        {errors.opis && (
          <p className="mt-1 text-sm text-red-600">{errors.opis.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="holiday-store-closed"
          type="checkbox"
          disabled={isProcessing}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          {...register('store_closed', { valueAsBoolean: true })}
        />
        <label htmlFor="holiday-store-closed" className="text-sm text-gray-700">
          Sklep zamknięty w tym dniu
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isProcessing}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isProcessing ? 'Zapisywanie…' : submitLabel}
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
