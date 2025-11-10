import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { HourLimit } from '@/types';
import { hourLimitFormSchema, type HourLimitFormData } from '@/types/schemas';
import { EMPLOYMENT_LABELS } from '@/types/hour-limit';
import { normalizeHourLimit } from '@/utils/hour-limit-normalizer';

export interface LimitFormProps {
  initialData?: HourLimit;
  onSubmit: (data: HourLimitFormData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function LimitForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = initialData ? 'Zapisz zmiany' : 'Dodaj limit',
}: LimitFormProps): React.JSX.Element {
  // Normalize initial data to handle both key variants
  const normalizedInitialData = initialData ? normalizeHourLimit(initialData) : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<HourLimitFormData>({
    resolver: zodResolver(hourLimitFormSchema),
    defaultValues: normalizedInitialData
      ? {
          etat: normalizedInitialData.etat,
          max_dziennie: normalizedInitialData.max_dziennie,
          max_tygodniowo: normalizedInitialData.max_tygodniowo,
          max_miesięcznie: normalizedInitialData.max_miesięcznie,
          max_kwartalnie: normalizedInitialData.max_kwartalnie,
        }
      : {
          etat: 1.0,
          max_dziennie: undefined,
          max_tygodniowo: undefined,
          max_miesięcznie: undefined,
          max_kwartalnie: undefined,
        },
  });

  const isProcessing = isSubmitting || isLoading;

  const handleFormSubmit = async (formData: HourLimitFormData) => {
    try {
      await onSubmit(formData);

      if (!initialData) {
        reset({
          etat: 1.0,
          max_dziennie: undefined,
          max_tygodniowo: undefined,
          max_miesięcznie: undefined,
          max_kwartalnie: undefined,
        });
      }
    } catch (error) {
      console.error('Błąd przy zapisywaniu limitu:', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="limit-etat" className="block text-sm font-medium text-gray-700">
          Etat <span className="text-red-500">*</span>
        </label>
        <select
          id="limit-etat"
          disabled={isProcessing || !!initialData}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.etat ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          } ${isProcessing || !!initialData ? 'cursor-not-allowed bg-gray-100' : 'bg-white'}`}
          {...register('etat', {
            valueAsNumber: true,
          })}
        >
          {Object.entries(EMPLOYMENT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.etat && (
          <p className="mt-1 text-sm text-red-600">{errors.etat.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="limit-daily" className="block text-sm font-medium text-gray-700">
          Maksymalnie na dzień (godzin)
        </label>
        <input
          id="limit-daily"
          type="number"
          step="0.5"
          min="0"
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.max_dziennie ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          } ${isProcessing ? 'cursor-not-allowed bg-gray-100' : 'bg-white'}`}
          {...register('max_dziennie', {
            valueAsNumber: true,
          })}
        />
        {errors.max_dziennie && (
          <p className="mt-1 text-sm text-red-600">{errors.max_dziennie.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="limit-weekly" className="block text-sm font-medium text-gray-700">
          Maksymalnie na tydzień (godzin)
        </label>
        <input
          id="limit-weekly"
          type="number"
          step="0.5"
          min="0"
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.max_tygodniowo ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          } ${isProcessing ? 'cursor-not-allowed bg-gray-100' : 'bg-white'}`}
          {...register('max_tygodniowo', {
            valueAsNumber: true,
          })}
        />
        {errors.max_tygodniowo && (
          <p className="mt-1 text-sm text-red-600">{errors.max_tygodniowo.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="limit-monthly" className="block text-sm font-medium text-gray-700">
          Maksymalnie na miesiąc (godzin)
        </label>
        <input
          id="limit-monthly"
          type="number"
          step="0.5"
          min="0"
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.max_miesięcznie ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          } ${isProcessing ? 'cursor-not-allowed bg-gray-100' : 'bg-white'}`}
          {...register('max_miesięcznie', {
            valueAsNumber: true,
          })}
        />
        {errors.max_miesięcznie && (
          <p className="mt-1 text-sm text-red-600">{errors.max_miesięcznie.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="limit-quarterly" className="block text-sm font-medium text-gray-700">
          Maksymalnie na kwartał (godzin)
        </label>
        <input
          id="limit-quarterly"
          type="number"
          step="0.5"
          min="0"
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.max_kwartalnie ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          } ${isProcessing ? 'cursor-not-allowed bg-gray-100' : 'bg-white'}`}
          {...register('max_kwartalnie', {
            valueAsNumber: true,
          })}
        />
        {errors.max_kwartalnie && (
          <p className="mt-1 text-sm text-red-600">{errors.max_kwartalnie.message}</p>
        )}
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
