import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DAY_NAMES,
  SHIFT_TYPES,
  type ShiftParameter,
} from '@/types';
import { shiftParameterAPI, getErrorMessage } from '@/services/api';
import {
  LoadingSpinner,
  ErrorMessage,
  ConfirmDialog,
} from '@/components/common';
import { shiftParameterInputSchema, dayFormSchema } from '@/lib/validation/schemas';
import type { DayFormData } from '@/types/shift-parameter';

type ShiftCategory = 'default' | 'lead';

/**
 * Per-day form state for React Hook Form integration
 */
interface DayFormState {
  form: ReturnType<typeof useForm<DayFormData>>;
  isExpanded: boolean;
  isSaving: boolean;
  error: string | null;
  success: string | null;
}

const SHIFT_TYPE_ORDER = SHIFT_TYPES.reduce<Record<string, number>>((acc, type, index) => {
  acc[type] = index;
  return acc;
}, {});

const createLocalId = () =>
  `shift-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Convert ShiftParameter from API to form-friendly ShiftFormValue
 */
const mapToFormValue = (shift: ShiftParameter) => ({
  localId: shift.id ?? createLocalId(),
  id: shift.id,
  dzien_tygodnia: shift.dzien_tygodnia,
  typ_zmiany: shift.typ_zmiany,
  godzina_od: shift.godzina_od,
  godzina_do: shift.godzina_do,
  liczba_obsad: shift.liczba_obsad,
  czy_prowadzacy: shift.czy_prowadzacy,
});

/**
 * Create empty shift for initial setup
 */
const createEmptyShift = (
  day: number,
  shiftType: (typeof SHIFT_TYPES)[number],
  isLead: boolean,
) => ({
  localId: createLocalId(),
  dzien_tygodnia: day,
  typ_zmiany: shiftType,
  godzina_od: '',
  godzina_do: '',
  liczba_obsad: 0,
  czy_prowadzacy: isLead,
});

/**
 * Sort shifts by type order, then by localId
 */
const sortShifts = (shifts: any[]) =>
  [...shifts].sort((a, b) => {
    const orderDiff = SHIFT_TYPE_ORDER[a.typ_zmiany] - SHIFT_TYPE_ORDER[b.typ_zmiany];
    if (orderDiff !== 0) {
      return orderDiff;
    }
    return a.localId.localeCompare(b.localId);
  });

/**
 * Ensure all three shift types are present for a category
 */
const ensureBaseShifts = (shifts: any[], day: number, isLead: boolean) => {
  const collection = [...shifts];

  SHIFT_TYPES.forEach((type) => {
    const hasType = collection.some((item) => item.typ_zmiany === type);
    if (!hasType) {
      collection.push(createEmptyShift(day, type, isLead));
    }
  });

  return sortShifts(collection);
};

/**
 * Create initial form data for a day
 */
const createInitialDayFormData = (day: number): DayFormData => ({
  defaultShifts: ensureBaseShifts([], day, false),
  leadShifts: ensureBaseShifts([], day, true),
});

/**
 * ParametryZmianTab Component
 *
 * Manages shift parameter configuration for all days of the week.
 * Uses React Hook Form with per-day form instances and Zod validation.
 */
export function ParametryZmianTab(): JSX.Element {
  // Initialize forms for each day (must be done outside useState)
  const formsRef = React.useRef<Record<number, ReturnType<typeof useForm<DayFormData>>>>({});
  React.useMemo(() => {
    DAY_NAMES.forEach((_, index) => {
      if (!formsRef.current[index]) {
        formsRef.current[index] = useForm<DayFormData>({
          resolver: zodResolver(dayFormSchema),
          defaultValues: createInitialDayFormData(index),
          mode: 'onBlur',
        });
      }
    });
  }, []);

  const [dayStates, setDayStates] = React.useState<Record<number, Omit<DayFormState, 'form'>>>(() => {
    const initial: Record<number, Omit<DayFormState, 'form'>> = {};
    DAY_NAMES.forEach((_, index) => {
      initial[index] = {
        isExpanded: index === 0,
        isSaving: false,
        error: null,
        success: null,
      };
    });
    return initial;
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<{
    day: number;
    shiftId: string;
  } | null>(null);

  const loadShiftParameters = React.useCallback(async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const data = await shiftParameterAPI.getAll();

      // Group by day and category
      const byDay = new Map<number, { default: typeof data; lead: typeof data }>();

      data.forEach((item) => {
        const dayData = byDay.get(item.dzien_tygodnia) ?? { default: [], lead: [] };
        if (item.czy_prowadzacy) {
          dayData.lead.push(item);
        } else {
          dayData.default.push(item);
        }
        byDay.set(item.dzien_tygodnia, dayData);
      });

      // Update each day's form with loaded data
      DAY_NAMES.forEach((_, dayIndex) => {
        const dayData = byDay.get(dayIndex) ?? { default: [], lead: [] };
        const form = formsRef.current[dayIndex];

        const defaultShifts = ensureBaseShifts(
          dayData.default.map(mapToFormValue),
          dayIndex,
          false,
        );
        const leadShifts = ensureBaseShifts(
          dayData.lead.map(mapToFormValue),
          dayIndex,
          true,
        );

        // Reset form with new data
        if (form) {
          form.reset({
            defaultShifts,
            leadShifts,
          });
        }
      });

      setDayStates((previousStates) => {
        const nextStates = { ...previousStates };
        DAY_NAMES.forEach((_, dayIndex) => {
          nextStates[dayIndex] = {
            ...previousStates[dayIndex],
            isSaving: false,
            error: null,
            success: null,
          };
        });
        return nextStates;
      });
    } catch (error) {
      setGlobalError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadShiftParameters();
  }, [loadShiftParameters]);

  /**
   * Toggle day expansion state
   */
  const handleToggleDay = (day: number) => {
    setDayStates((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isExpanded: !prev[day].isExpanded,
      },
    }));
  };

  /**
   * Handle shift removal (with confirmation for saved shifts)
   */
  const handleRemoveShift = (day: number, category: ShiftCategory, index: number, shiftId?: string) => {
    const form = formsRef.current[day];
    if (!form) return;

    const fieldArrayKey = category === 'default' ? 'defaultShifts' : 'leadShifts';

    // Check if we can remove (must have at least 3 shifts, one per type)
    const currentShifts = form.getValues(fieldArrayKey);
    if (currentShifts.length <= SHIFT_TYPES.length) {
      return;
    }

    if (shiftId) {
      // Confirm deletion for shifts with IDs
      setConfirmDelete({ day, shiftId });
      return;
    }

    // Remove unsaved shift immediately by setting the array without this index
    const updated = currentShifts.filter((_, i) => i !== index);
    form.setValue(fieldArrayKey, updated);
  };

  /**
   * Handle adding a new shift to a category
   */
  const handleAddShift = (day: number, category: ShiftCategory) => {
    const form = formsRef.current[day];
    if (!form) return;

    const fieldArrayKey = category === 'default' ? 'defaultShifts' : 'leadShifts';
    const currentShifts = form.getValues(fieldArrayKey);

    // Find available shift type
    const usedTypes = new Set(currentShifts.map((item) => item.typ_zmiany));
    const availableType = SHIFT_TYPES.find((type) => !usedTypes.has(type)) ?? SHIFT_TYPES[0];

    // Add new shift
    const newShift = createEmptyShift(day, availableType, category === 'lead');
    form.setValue(fieldArrayKey, [...currentShifts, newShift]);
  };

  /**
   * Confirm and delete a shift from the backend
   */
  const confirmDeleteShift = async (day: number, shiftId: string) => {
    setConfirmDelete(null);
    try {
      await shiftParameterAPI.delete(shiftId);
      await loadShiftParameters();
    } catch (error) {
      setDayStates((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          error: getErrorMessage(error),
        },
      }));
    }
  };

  /**
   * Save a day's shift configuration
   * Validates with Zod, separates into CREATE/UPDATE/DELETE operations, and persists to backend
   */
  const handleSaveDay = async (day: number) => {
    const form = formsRef.current[day];
    if (!form) return;

    // Trigger validation on all fields
    const isValid = await form.trigger();
    if (!isValid) {
      setDayStates((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          error: 'Popraw błędy w sekcji dnia przed zapisaniem.',
          success: null,
        },
      }));
      return;
    }

    // Set saving state
    setDayStates((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isSaving: true,
        error: null,
        success: null,
      },
    }));

    try {
      const formData = form.getValues();
      const combined = [...formData.defaultShifts, ...formData.leadShifts];

      // Separate into new (no id), existing (with id), and deleted
      const createPayload = combined.filter((entry) => !entry.id);
      const updatePayload = combined.filter((entry) => entry.id);

      // Execute all requests in parallel
      const requests = [
        ...createPayload.map((entry) =>
          shiftParameterAPI.create({
            dzien_tygodnia: day,
            typ_zmiany: entry.typ_zmiany,
            godzina_od: entry.godzina_od,
            godzina_do: entry.godzina_do,
            liczba_obsad: entry.liczba_obsad,
            czy_prowadzacy: entry.czy_prowadzacy,
          }),
        ),
        ...updatePayload.map((entry) =>
          shiftParameterAPI.update(entry.id!, {
            dzien_tygodnia: day,
            typ_zmiany: entry.typ_zmiany,
            godzina_od: entry.godzina_od,
            godzina_do: entry.godzina_do,
            liczba_obsad: entry.liczba_obsad,
            czy_prowadzacy: entry.czy_prowadzacy,
          }),
        ),
      ];

      await Promise.all(requests);

      // Reload data from backend to ensure consistency
      const refreshed = await shiftParameterAPI.getByDay(day);
      const defaultShifts = ensureBaseShifts(
        refreshed
          .map(mapToFormValue)
          .filter((entry) => !entry.czy_prowadzacy),
        day,
        false,
      );
      const leadShifts = ensureBaseShifts(
        refreshed
          .map(mapToFormValue)
          .filter((entry) => entry.czy_prowadzacy),
        day,
        true,
      );

      // Reset form with refreshed data
      dayState.form.reset({ defaultShifts, leadShifts });

      setDayStates((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          isSaving: false,
          success: 'Ustawienia zapisane pomyślnie.',
          error: null,
        },
      }));
    } catch (error) {
      setDayStates((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          isSaving: false,
          error: getErrorMessage(error),
          success: null,
        },
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <LoadingSpinner message="Ładujemy parametry zmian..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Parametry zmian</h2>
        <p className="text-sm text-gray-600">
          Skonfiguruj domyślne ustawienia zmian oraz prowadzących dla każdego dnia tygodnia.
        </p>
      </div>

      {globalError && <ErrorMessage message={globalError} />}

      <div className="space-y-4">
        {DAY_NAMES.map((dayName, dayIndex) => {
          const dayState = dayStates[dayIndex];
          const form = formsRef.current[dayIndex];
          if (!dayState || !form) {
            return null;
          }

          const renderSection = (
            category: ShiftCategory,
            heading: string,
            description: string,
          ) => {
            const shifts = form.watch(category === 'default' ? 'defaultShifts' : 'leadShifts');

            return (
              <div className="space-y-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">{heading}</h3>
                    <p className="text-xs text-gray-500">{description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddShift(dayIndex, category)}
                    className="mt-2 inline-flex items-center justify-center rounded-md border border-dashed border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:mt-0"
                  >
                    + dodaj kolejną zmianę
                  </button>
                </div>

                <div className="space-y-4">
                  {shifts.map((shift, index) => {
                    const fieldName = (category === 'default' ? 'defaultShifts' : 'leadShifts') as const;
                    const errors = form.formState.errors[fieldName]?.[index];
                    const canRemove = shifts.length > SHIFT_TYPES.length;

                    return (
                      <div key={shift.localId} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {shift.typ_zmiany}
                            </p>
                            <p className="text-xs text-gray-500">
                              {category === 'lead' ? 'Prowadzący zmianę' : 'Domyślne ustawienie zmiany'}
                            </p>
                          </div>
                          {canRemove && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveShift(
                                  dayIndex,
                                  category,
                                  index,
                                  shift.id,
                                )
                              }
                              disabled={dayState.isSaving}
                              className="self-start rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 md:self-auto"
                            >
                              Usuń
                            </button>
                          )}
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-4">
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-600">
                              Typ zmiany
                            </label>
                            <Controller
                              control={form.control}
                              name={`${fieldName}.${index}.typ_zmiany`}
                              render={({ field }) => (
                                <select
                                  {...field}
                                  disabled={dayState.isSaving}
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
                                    disabled={dayState.isSaving}
                                    className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                                      error ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    onBlur={() => form.trigger(`${fieldName}.${index}`)}
                                  />
                                  {error && (
                                    <p className="text-xs text-red-600">{error.message}</p>
                                  )}
                                </>
                              )}
                            />
                          </div>

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
                                    disabled={dayState.isSaving}
                                    className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                                      error ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    onBlur={() => form.trigger(`${fieldName}.${index}`)}
                                  />
                                  {error && (
                                    <p className="text-xs text-red-600">{error.message}</p>
                                  )}
                                </>
                              )}
                            />
                          </div>

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
                                    disabled={dayState.isSaving}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                                      error ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    onBlur={() => form.trigger(`${fieldName}.${index}`)}
                                  />
                                  {error && (
                                    <p className="text-xs text-red-600">{error.message}</p>
                                  )}
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
            <section
              key={dayName}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => handleToggleDay(dayIndex)}
                className="flex w-full items-center justify-between bg-gray-50 px-5 py-4 text-left"
              >
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{dayName}</h3>
                  <p className="text-xs text-gray-500">
                    Skonfiguruj zmianę poranną, środkową i popołudniową oraz prowadzących.
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {dayState.isExpanded ? 'Zwiń' : 'Rozwiń'}
                </span>
              </button>

              {dayState.isExpanded && (
                <div className="space-y-6 border-t border-gray-200 px-5 py-6">
                  {renderSection(
                    'default',
                    'Domyślne ustawienia zmian',
                    'Standardowa obsada zmian: Rano, Środek, Popołudnie.',
                  )}

                  {renderSection(
                    'lead',
                    'Prowadzący zmianę',
                    'Osoby prowadzące każdą zmianę (min. 1 osoba na zmianę).',
                  )}

                  {dayState.error && <ErrorMessage message={dayState.error} />}
                  {dayState.success && (
                    <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                      {dayState.success}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveDay(dayIndex)}
                      disabled={dayState.isSaving}
                      className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {dayState.isSaving ? 'Zapisywanie...' : 'Zapisz ustawienia dnia'}
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          isOpen
          title="Usuń konfigurację zmiany"
          message="Czy na pewno chcesz usunąć tę konfigurację zmiany?"
          confirmLabel="Usuń"
          cancelLabel="Anuluj"
          isDestructive
          onConfirm={() => confirmDeleteShift(confirmDelete.day, confirmDelete.shiftId)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
