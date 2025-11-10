import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Rule } from '@/types';
import { ruleFormSchema, type RuleFormData } from '@/types/schemas';
import { RULE_TYPES } from '@/types/rule';

export interface RuleFormProps {
  initialData?: Rule;
  onSubmit: (data: RuleFormData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function RuleForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = initialData ? 'Zapisz zmiany' : 'Dodaj regułę',
}: RuleFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RuleFormData>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: initialData
      ? {
          nazwa: initialData.nazwa,
          opis: initialData.opis,
          typ: initialData.typ,
        }
      : {
          nazwa: '',
          opis: undefined,
          typ: undefined,
        },
  });

  const isProcessing = isSubmitting || isLoading;

  const handleFormSubmit = async (formData: RuleFormData) => {
    const payload: RuleFormData = {
      ...formData,
      opis: formData.opis?.trim() ? formData.opis.trim() : undefined,
      typ: formData.typ?.trim() ? formData.typ.trim() : undefined,
    };

    try {
      await onSubmit(payload);

      if (!initialData) {
        reset({ nazwa: '', opis: undefined, typ: undefined });
      }
    } catch (error) {
      console.error('Błąd przy zapisywaniu reguły:', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="rule-name" className="block text-sm font-medium text-gray-700">
          Nazwa <span className="text-red-500">*</span>
        </label>
        <input
          id="rule-name"
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
        <label htmlFor="rule-type" className="block text-sm font-medium text-gray-700">
          Typ (opcjonalnie)
        </label>
        <select
          id="rule-type"
          disabled={isProcessing}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.typ ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          } ${isProcessing ? 'cursor-not-allowed bg-gray-100' : 'bg-white'}`}
          {...register('typ')}
        >
          <option value="">-- Wybierz typ --</option>
          {RULE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.typ && (
          <p className="mt-1 text-sm text-red-600">{errors.typ.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="rule-description" className="block text-sm font-medium text-gray-700">
          Opis (opcjonalnie)
        </label>
        <textarea
          id="rule-description"
          rows={4}
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
