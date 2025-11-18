/**
 * ShiftParameterForm Component
 * 
 * React Hook Form + Zod validated form for shift parameter configuration.
 * Integrated with parent forms using useFieldArray pattern.
 * 
 * Features:
 * - Zod validation with Polish error messages
 * - Type-safe form handling via React Hook Form
 * - Cross-field validation (godzina_od < godzina_do)
 * - Blur-triggered validation for real-time feedback
 */

import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { SHIFT_TYPES } from '@/types';
import type { DayFormData } from '@/types/shift-parameter';

export type ShiftParameterFormValue = {
  localId: string;
  id?: string;
  dzien_tygodnia: number;
  typ_zmiany: (typeof SHIFT_TYPES)[number];
  godzina_od: string;
  godzina_do: string;
  liczba_obsad: number;
  czy_prowadzacy: boolean;
};

export interface ShiftParameterFormProps {
  form: UseFormReturn<DayFormData>;
  fieldName: 'defaultShifts' | 'leadShifts';
  index: number;
  onRemove?: () => void;
  disabled?: boolean;
  isLead?: boolean;
  label?: string;
  disableShiftType?: boolean;
}

export function ShiftParameterForm({
  form,
  fieldName,
  index,
  onRemove,
  disabled = false,
  isLead = false,
  label,
  disableShiftType = false,
}: ShiftParameterFormProps): JSX.Element {
  const shift = form.watch(`${fieldName}.${index}`);
  const errors = form.formState.errors[fieldName]?.[index];

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${
        disabled ? 'opacity-80' : ''
      }`}
    >
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {label ?? shift.typ_zmiany}
          </p>
          <p className="text-xs text-gray-500">
            {isLead ? 'Prowadzący zmianę' : 'Domyślne ustawienie zmiany'}
          </p>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="self-start rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 md:self-auto"
          >
            Usuń
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        {/* Typ zmiany */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">
            Typ zmiany
          </label>
          <Controller
            control={form.control}
            name={`${fieldName}.${index}.typ_zmiany`}
            render={({ field, fieldState: { error } }) => (
              <>
                <select
                  {...field}
                  disabled={disabled || disableShiftType}
                  className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {SHIFT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {error && <p className="text-xs text-red-600">{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Godzina od */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">
            Godzina od
          </label>
          <Controller
            control={form.control}
            name={`${fieldName}.${index}.godzina_od`}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="time"
                  disabled={disabled}
                  className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onBlur={() => form.trigger(`${fieldName}.${index}`)}
                />
                {error && <p className="text-xs text-red-600">{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Godzina do */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">
            Godzina do
          </label>
          <Controller
            control={form.control}
            name={`${fieldName}.${index}.godzina_do`}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="time"
                  disabled={disabled}
                  className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onBlur={() => form.trigger(`${fieldName}.${index}`)}
                />
                {error && <p className="text-xs text-red-600">{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Liczba pracowników */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">
            Liczba pracowników
          </label>
          <Controller
            control={form.control}
            name={`${fieldName}.${index}.liczba_obsad`}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="number"
                  min={0}
                  disabled={disabled}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onBlur={() => form.trigger(`${fieldName}.${index}`)}
                />
                {error && <p className="text-xs text-red-600">{error.message}</p>}
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
}
