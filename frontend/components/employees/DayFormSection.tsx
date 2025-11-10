/**
 * DayFormSection Component
 * Manages a single day's shift parameters with dynamic field array management.
 * Uses React Hook Form's useFieldArray for proper add/remove shift functionality.
 */

import React from 'react';
import { useFieldArray, Controller, UseFormReturn } from 'react-hook-form';
import { SHIFT_TYPES } from '@/types';
import type { DayFormData } from '@/types/shift-parameter';

export interface DayFormSectionProps {
  dayIndex: number;
  dayName: string;
  form: UseFormReturn<DayFormData>;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  isExpanded: boolean;
  onToggleDay: (dayIndex: number) => void;
  onAddShift: (dayIndex: number, category: 'default' | 'lead') => void;
  onRemoveShift: (dayIndex: number, category: 'default' | 'lead', index: number, shiftId?: string) => void;
  onSaveDay?: (dayIndex: number) => void | Promise<void>;
}

/**
 * T013/T014: Implement useFieldArray for dynamic shift management
 * Manages both defaultShifts and leadShifts field arrays
 */
export function DayFormSection({
  dayIndex,
  dayName,
  form,
  isSaving,
  error,
  success,
  isExpanded,
  onToggleDay,
  onAddShift,
  onRemoveShift,
  onSaveDay,
}: DayFormSectionProps): JSX.Element {
  // T013: useFieldArray for defaultShifts
  const defaultFieldArray = useFieldArray({
    control: form.control,
    name: 'defaultShifts',
  });

  // T014: useFieldArray for leadShifts
  const leadFieldArray = useFieldArray({
    control: form.control,
    name: 'leadShifts',
  });

  const renderShiftSection = (
    category: 'default' | 'lead',
    heading: string,
    description: string,
    fieldArray: ReturnType<typeof useFieldArray>,
  ) => {
    const shifts = form.watch(category === 'default' ? 'defaultShifts' : 'leadShifts');
    const fieldName = (category === 'default' ? 'defaultShifts' : 'leadShifts') as const;

    // T015: "+ dodaj kolejną zmianę" button functionality
    const handleAddClick = () => {
      onAddShift(dayIndex, category);
    };

    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">{heading}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          {/* T015: Add shift button */}
          <button
            type="button"
            onClick={handleAddClick}
            disabled={isSaving}
            className="mt-2 inline-flex items-center justify-center rounded-md border border-dashed border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:mt-0"
          >
            + dodaj kolejną zmianę
          </button>
        </div>

        <div className="space-y-4">
          {shifts.map((shift, index) => {
            const errors = form.formState.errors[fieldName]?.[index];
            // T018: Validate minimum 3 shifts per category
            const canRemove = shifts.length > SHIFT_TYPES.length;

            return (
              <div
                key={shift.localId}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{shift.typ_zmiany}</p>
                    <p className="text-xs text-gray-500">
                      {category === 'lead' ? 'Prowadzący zmianę' : 'Domyślne ustawienie zmiany'}
                    </p>
                  </div>
                  {canRemove && (
                    <button
                      type="button"
                      onClick={() => onRemoveShift(dayIndex, category, index, shift.id)}
                      disabled={isSaving}
                      className="self-start rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 md:self-auto"
                    >
                      Usuń
                    </button>
                  )}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  {/* Typ zmiany */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Typ zmiany</label>
                    <Controller
                      control={form.control}
                      name={`${fieldName}.${index}.typ_zmiany`}
                      render={({ field }) => (
                        <select
                          {...field}
                          disabled={isSaving}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          {SHIFT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  {/* Godzina od */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Godzina od</label>
                    <Controller
                      control={form.control}
                      name={`${fieldName}.${index}.godzina_od`}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <input
                            {...field}
                            type="time"
                            disabled={isSaving}
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
                    <label className="block text-xs font-medium text-gray-600">Godzina do</label>
                    <Controller
                      control={form.control}
                      name={`${fieldName}.${index}.godzina_do`}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <input
                            {...field}
                            type="time"
                            disabled={isSaving}
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
                            min="0"
                            disabled={isSaving}
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
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => onToggleDay(dayIndex)}
        className="flex w-full items-center justify-between bg-gray-50 px-5 py-4 text-left"
      >
        <div>
          <h3 className="text-base font-semibold text-gray-900">{dayName}</h3>
          <p className="text-xs text-gray-500">
            Skonfiguruj zmianę poranną, środkową i popołudniową oraz prowadzących.
          </p>
        </div>
        <span className="text-sm text-gray-500">{isExpanded ? 'Zwiń' : 'Rozwiń'}</span>
      </button>

      {isExpanded && (
        <div className="space-y-6 border-t border-gray-200 px-5 py-6">
          {renderShiftSection(
            'default',
            'Domyślne ustawienia zmian',
            'Standardowa obsada zmian: Rano, Środek, Popołudnie.',
            defaultFieldArray,
          )}

          {renderShiftSection(
            'lead',
            'Prowadzący zmianę',
            'Osoby prowadzące każdą zmianę (min. 1 osoba na zmianę).',
            leadFieldArray,
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</div>
          )}

          {/* T019: Save button disabled during submission */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onSaveDay?.(dayIndex)}
              disabled={isSaving}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSaving ? 'Zapisywanie...' : 'Zapisz ustawienia dnia'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
