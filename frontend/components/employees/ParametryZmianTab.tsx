import React from 'react';
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
import {
  ShiftParameterForm,
  type ShiftParameterFormValue,
} from './forms/ShiftParameterForm';
import { shiftParameterFormSchema } from '@/types/schemas';

type ShiftCategory = 'default' | 'lead';

interface DayState {
  defaultShifts: ShiftParameterFormValue[];
  leadShifts: ShiftParameterFormValue[];
  isExpanded: boolean;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  validationErrors: Record<string, string | null>;
}

const SHIFT_TYPE_ORDER = SHIFT_TYPES.reduce<Record<string, number>>((acc, type, index) => {
  acc[type] = index;
  return acc;
}, {});

const createLocalId = () =>
  `shift-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyShift = (
  day: number,
  shiftType: (typeof SHIFT_TYPES)[number],
  isLead: boolean,
): ShiftParameterFormValue => ({
  localId: createLocalId(),
  dzien_tygodnia: day,
  typ_zmiany: shiftType,
  godzina_od: '',
  godzina_do: '',
  liczba_obsad: 0,
  czy_prowadzacy: isLead,
});

const mapToFormValue = (shift: ShiftParameter): ShiftParameterFormValue => ({
  localId: shift.id ?? createLocalId(),
  id: shift.id,
  dzien_tygodnia: shift.dzien_tygodnia,
  typ_zmiany: shift.typ_zmiany,
  godzina_od: shift.godzina_od,
  godzina_do: shift.godzina_do,
  liczba_obsad: shift.liczba_obsad,
  czy_prowadzacy: shift.czy_prowadzacy,
});

const sortShifts = (shifts: ShiftParameterFormValue[]): ShiftParameterFormValue[] =>
  [...shifts].sort((a, b) => {
    const orderDiff = SHIFT_TYPE_ORDER[a.typ_zmiany] - SHIFT_TYPE_ORDER[b.typ_zmiany];
    if (orderDiff !== 0) {
      return orderDiff;
    }

    return a.localId.localeCompare(b.localId);
  });

const ensureBaseShifts = (
  shifts: ShiftParameterFormValue[],
  day: number,
  isLead: boolean,
): ShiftParameterFormValue[] => {
  const collection = [...shifts];

  SHIFT_TYPES.forEach((type) => {
    const hasType = collection.some((item) => item.typ_zmiany === type);
    if (!hasType) {
      collection.push(createEmptyShift(day, type, isLead));
    }
  });

  return sortShifts(collection);
};

const createInitialDayState = (day: number): DayState => ({
  defaultShifts: ensureBaseShifts([], day, false),
  leadShifts: ensureBaseShifts([], day, true),
  isExpanded: day === 0,
  isSaving: false,
  error: null,
  success: null,
  validationErrors: {},
});

function updateCollection(
  collection: ShiftParameterFormValue[],
  localId: string,
  updated: ShiftParameterFormValue,
) {
  return collection.map((item) => (item.localId === localId ? updated : item));
}

function removeFromCollection(
  collection: ShiftParameterFormValue[],
  localId: string,
) {
  return collection.filter((item) => item.localId !== localId);
}

export function ParametryZmianTab(): JSX.Element {
  const [days, setDays] = React.useState<Record<number, DayState>>(() => {
    const initial: Record<number, DayState> = {};
    DAY_NAMES.forEach((_, index) => {
      initial[index] = createInitialDayState(index);
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

      setDays((previousDays) => {
        const byDay = new Map<number, ShiftParameterFormValue[]>();
        data.forEach((item) => {
          const formValue = mapToFormValue(item);
          const collection = byDay.get(formValue.dzien_tygodnia) ?? [];
          collection.push(formValue);
          byDay.set(formValue.dzien_tygodnia, collection);
        });

        const nextState: Record<number, DayState> = {};
        DAY_NAMES.forEach((_, dayIndex) => {
          const existing = byDay.get(dayIndex) ?? [];
          const defaultShifts = ensureBaseShifts(
            existing.filter((item) => !item.czy_prowadzacy),
            dayIndex,
            false,
          );
          const leadShifts = ensureBaseShifts(
            existing.filter((item) => item.czy_prowadzacy),
            dayIndex,
            true,
          );

          const previous = previousDays[dayIndex] ?? createInitialDayState(dayIndex);
          nextState[dayIndex] = {
            ...previous,
            defaultShifts,
            leadShifts,
            isSaving: false,
            error: null,
            success: null,
            validationErrors: {},
          };
        });

        return nextState;
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

  const handleToggleDay = (day: number) => {
    setDays((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isExpanded: !prev[day].isExpanded,
      },
    }));
  };

  const updateDayState = (
    day: number,
    category: ShiftCategory,
    updater: (collection: ShiftParameterFormValue[]) => ShiftParameterFormValue[],
    resetMessages = true,
  ) => {
    setDays((prev) => {
      const dayState = prev[day];
      const targetKey = category === 'default' ? 'defaultShifts' : 'leadShifts';
      const updatedCollection = updater(dayState[targetKey]);

      const updatedValidation = { ...dayState.validationErrors };
      updatedCollection.forEach((entry) => {
        if (!(entry.localId in updatedValidation)) {
          updatedValidation[entry.localId] = null;
        }
      });

      return {
        ...prev,
        [day]: {
          ...dayState,
          [targetKey]: updatedCollection,
          validationErrors: updatedValidation,
          ...(resetMessages
            ? {
                error: null,
                success: null,
              }
            : {}),
        },
      };
    });
  };

  const handleShiftChange = (
    day: number,
    category: ShiftCategory,
    localId: string,
  ) => (updated: ShiftParameterFormValue) => {
    updateDayState(
      day,
      category,
      (collection) =>
        updateCollection(collection, localId, {
          ...updated,
          dzien_tygodnia: day,
          czy_prowadzacy: category === 'lead',
        }),
    );

    setDays((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        validationErrors: {
          ...prev[day].validationErrors,
          [localId]: null,
        },
      },
    }));
  };

  const handleAddShift = (day: number, category: ShiftCategory) => {
    updateDayState(
      day,
      category,
      (collection) => {
        const usedTypes = new Set(collection.map((item) => item.typ_zmiany));
        const fallbackType = SHIFT_TYPES.find((type) => !usedTypes.has(type)) ?? SHIFT_TYPES[0];
        return [
          ...collection,
          createEmptyShift(day, fallbackType, category === 'lead'),
        ];
      },
    );
  };

  const handleRemoveShift = (
    day: number,
    category: ShiftCategory,
    localId: string,
    shiftId?: string,
  ) => {
    const state = days[day];
    const targetKey = category === 'default' ? 'defaultShifts' : 'leadShifts';
    const collection = state[targetKey];

    if (collection.length <= SHIFT_TYPES.length) {
      return;
    }

    if (shiftId) {
      setConfirmDelete({ day, shiftId });
      return;
    }

    updateDayState(
      day,
      category,
      (current) => removeFromCollection(current, localId),
    );

    setDays((prev) => {
      const dayState = prev[day];
      const nextValidation = { ...dayState.validationErrors };
      delete nextValidation[localId];

      return {
        ...prev,
        [day]: {
          ...dayState,
          validationErrors: nextValidation,
        },
      };
    });
  };

  const confirmDeleteShift = async (day: number, shiftId: string) => {
    setConfirmDelete(null);
    try {
      await shiftParameterAPI.delete(shiftId);
      await loadShiftParameters();
    } catch (error) {
      setDays((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          error: getErrorMessage(error),
        },
      }));
    }
  };

  const handleSaveDay = async (day: number) => {
    const dayState = days[day];
    if (!dayState) {
      return;
    }

    const combined = [...dayState.defaultShifts, ...dayState.leadShifts];
    const validationErrors: Record<string, string | null> = {};
    let hasValidationError = false;

    combined.forEach((entry) => {
      const result = shiftParameterFormSchema.safeParse({
        dzien_tygodnia: day,
        typ_zmiany: entry.typ_zmiany,
        godzina_od: entry.godzina_od,
        godzina_do: entry.godzina_do,
        liczba_obsad: entry.liczba_obsad,
        czy_prowadzacy: entry.czy_prowadzacy,
      });

      if (!result.success) {
        const issue = result.error.issues[0];
        validationErrors[entry.localId] = issue?.message ?? 'Nieprawidłowe dane';
        hasValidationError = true;
      } else {
        validationErrors[entry.localId] = null;
      }
    });

    if (hasValidationError) {
      setDays((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          validationErrors: {
            ...prev[day].validationErrors,
            ...validationErrors,
          },
          error: 'Popraw błędy w sekcji dnia przed zapisaniem.',
          success: null,
        },
      }));
      return;
    }

    setDays((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isSaving: true,
        error: null,
        success: null,
        validationErrors: {
          ...prev[day].validationErrors,
          ...validationErrors,
        },
      },
    }));

    try {
      const createPayload = combined.filter((entry) => !entry.id);
      const updatePayload = combined.filter((entry) => entry.id);

      const createPromises = createPayload.map((entry) =>
        shiftParameterAPI.create({
          dzien_tygodnia: day,
          typ_zmiany: entry.typ_zmiany,
          godzina_od: entry.godzina_od,
          godzina_do: entry.godzina_do,
          liczba_obsad: entry.liczba_obsad,
          czy_prowadzacy: entry.czy_prowadzacy,
        }),
      );

      const updatePromises = updatePayload.map((entry) =>
        shiftParameterAPI.update(entry.id!, {
          dzien_tygodnia: day,
          typ_zmiany: entry.typ_zmiany,
          godzina_od: entry.godzina_od,
          godzina_do: entry.godzina_do,
          liczba_obsad: entry.liczba_obsad,
          czy_prowadzacy: entry.czy_prowadzacy,
        }),
      );

      await Promise.all([...createPromises, ...updatePromises]);

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

      setDays((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          defaultShifts,
          leadShifts,
          isSaving: false,
          success: 'Ustawienia zapisane pomyślnie.',
          error: null,
          validationErrors: {},
        },
      }));
    } catch (error) {
      setDays((prev) => ({
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
          const dayState = days[dayIndex];
          if (!dayState) {
            return null;
          }

          const renderSection = (
            category: ShiftCategory,
            heading: string,
            description: string,
            collection: ShiftParameterFormValue[],
          ) => {
            const targetKey = category === 'default' ? 'defaultShifts' : 'leadShifts';

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
                  {collection.map((shift) => {
                    const validationMessage = dayState.validationErrors[shift.localId] ?? null;
                    const canRemove = dayState[targetKey].length > SHIFT_TYPES.length;
                    return (
                      <ShiftParameterForm
                        key={shift.localId}
                        value={shift}
                        onChange={handleShiftChange(dayIndex, category, shift.localId)}
                        onRemove={
                          canRemove
                            ? () =>
                                handleRemoveShift(
                                  dayIndex,
                                  category,
                                  shift.localId,
                                  shift.id,
                                )
                            : undefined
                        }
                        disabled={dayState.isSaving}
                        isLead={category === 'lead'}
                        error={validationMessage}
                      />
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
                    dayState.defaultShifts,
                  )}

                  {renderSection(
                    'lead',
                    'Prowadzący zmianę',
                    'Osoby prowadzące każdą zmianę (min. 1 osoba na zmianę).',
                    dayState.leadShifts,
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
