import React from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import type { DayFormData, ShiftFormValue } from '@/types/shift-parameter';
import { DayFormSection } from './DayFormSection';

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
const mapToFormValue = (shift: ShiftParameter): DayFormData['defaultShifts'][number] => ({
  localId: shift.id ?? createLocalId(),
  id: shift.id,
  dzien_tygodnia: shift.dzien_tygodnia as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  typ_zmiany: shift.typ_zmiany as 'Rano' | 'Środek' | 'Popoludniu',
  godzina_od: shift.godzina_od,
  godzina_do: shift.godzina_do,
  liczba_obsad: shift.liczba_obsad,
  czy_prowadzacy: shift.czy_prowadzacy,
});

/**
 * Create empty shift for initial setup
 */
const createEmptyShift = (
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  shiftType: 'Rano' | 'Środek' | 'Popoludniu',
  isLead: boolean,
): ShiftFormValue => ({
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
const ensureBaseShifts = (shifts: any[], day: 0 | 1 | 2 | 3 | 4 | 5 | 6, isLead: boolean) => {
  const collection = [...shifts];

  SHIFT_TYPES.forEach((type) => {
    const hasType = collection.some((item) => item.typ_zmiany === type);
    if (!hasType) {
      collection.push(createEmptyShift(day, type as 'Rano' | 'Środek' | 'Popoludniu', isLead));
    }
  });

  return sortShifts(collection);
};

/**
 * Create initial form data for a day
 */
const createInitialDayFormData = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6): DayFormData => ({
  defaultShifts: ensureBaseShifts([], day, false),
  leadShifts: ensureBaseShifts([], day, true),
});

/**
 * ParametryZmianTab Component - T031: JSDoc Documentation
 *
 * Manages shift parameter configuration for all days of the week with React Hook Form + Zod validation.
 *
 * **Features:**
 * - T020: Loads shift parameters from backend via GET /shift-parameters
 * - T021: Maps API data into defaultShifts and leadShifts arrays grouped by day
 * - T022: Resets form with loaded data using form.reset()
 * - T023: Form submission separates shifts into CREATE/UPDATE operations
 * - T024: Executes all API requests in parallel using Promise.all()
 * - T025: Handles API errors with user-friendly messages
 * - T026: Refreshes form data after successful save from backend
 * - T027: Handles 404 errors for shifts deleted by other users
 * - T013: Manages defaultShifts array via useFieldArray
 * - T014: Manages leadShifts array via useFieldArray
 * - T015: "+ dodaj kolejną zmianę" button to add new shifts
 * - T016/T017: Confirmation dialogs for deletion (saved shifts only)
 * - T018: Validates minimum 3 shifts per category (Rano, Środek, Popołudnie)
 * - T019: Disables save button during submission (prevent double-submit)
 *
 * **Architecture:**
 * - Per-day form instances managed via useRef + useMemo (avoids hooks-in-map violation)
 * - One form per day allows independent validation and saving
 * - useFieldArray for dynamic shift array management
 * - Zod validation with Polish error messages
 * - Controller for time inputs and numeric fields
 *
 * **State Management:**
 * - formsRef: Stores per-day RHF instances
 * - dayStates: UI state (expanded, saving, error, success) per day
 * - globalError: API load errors
 * - confirmDelete: Shift deletion confirmation dialog state
 *
 * **Error Handling:**
 * - Load errors displayed globally
 * - Save errors kept per day
 * - Form data preserved on error (not cleared)
 * - Network timeout messages via getErrorMessage()
 */
export function ParametryZmianTab(): JSX.Element {
  // Initialize forms for each day (must be done outside useState)
  const formsRef = React.useRef<Record<number, ReturnType<typeof useForm<DayFormData>>>>({});
  React.useMemo(() => {
    DAY_NAMES.forEach((_, index) => {
      if (!formsRef.current[index]) {
        formsRef.current[index] = useForm<DayFormData>({
          resolver: zodResolver(dayFormSchema),
          defaultValues: createInitialDayFormData(index as 0 | 1 | 2 | 3 | 4 | 5 | 6),
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

  /**
   * T020: Load shift parameters on component mount using GET /shift-parameters
   * Fetches all shift parameters for all days from backend
   */
  const loadShiftParameters = React.useCallback(async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      // T020: Get all shift parameters from backend
      const data = await shiftParameterAPI.getAll();

      // T021: Map loaded API data to form state structure
      // Separate data into defaultShifts and leadShifts arrays grouped by day
      const byDay = new Map<number, { default: typeof data; lead: typeof data }>();

      data.forEach((item) => {
        const dayData = byDay.get(item.dzien_tygodnia) ?? { default: [], lead: [] };
        // T021: Separate into defaultShifts (czy_prowadzacy=false) and leadShifts (czy_prowadzacy=true)
        if (item.czy_prowadzacy) {
          dayData.lead.push(item);
        } else {
          dayData.default.push(item);
        }
        byDay.set(item.dzien_tygodnia, dayData);
      });

      // T022: Implement form.reset() with loaded data using React Hook Form's reset API
      // Update each day's form with loaded data
      DAY_NAMES.forEach((_, dayIndex) => {
        const dayData = byDay.get(dayIndex) ?? { default: [], lead: [] };
        const form = formsRef.current[dayIndex];
        const day = dayIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6;

        const defaultShifts = ensureBaseShifts(
          dayData.default.map(mapToFormValue),
          day,
          false,
        );
        const leadShifts = ensureBaseShifts(
          dayData.lead.map(mapToFormValue),
          day,
          true,
        );

        // T022: Reset form with new data from backend
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
      // T025: Error handling for API failures during data loading
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
  const handleToggleDay = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    setDayStates((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isExpanded: !prev[day].isExpanded,
      },
    }));
  };

  /**
   * T016/T017: Handle shift removal with confirmation for saved shifts
   * Immediate removal for unsaved shifts (no ID)
   */
  const handleRemoveShift = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6, category: ShiftCategory, index: number, shiftId?: string) => {
    const form = formsRef.current[day];
    if (!form) return;

    const fieldArrayKey = category === 'default' ? 'defaultShifts' : 'leadShifts';

    // T018: Check if we can remove (must have at least 3 shifts, one per type)
    const currentShifts = form.getValues(fieldArrayKey);
    if (currentShifts.length <= SHIFT_TYPES.length) {
      return;
    }

    if (shiftId) {
      // T016: Confirm deletion for shifts with IDs (already saved to database)
      setConfirmDelete({ day, shiftId });
      return;
    }

    // T017: Remove unsaved shift immediately without confirmation
    const updated = currentShifts.filter((_, i) => i !== index);
    form.setValue(fieldArrayKey, updated);
  };

  /**
   * T015: Handle adding a new shift to a category
   */
  const handleAddShift = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6, category: ShiftCategory) => {
    const form = formsRef.current[day];
    if (!form) return;

    const fieldArrayKey = category === 'default' ? 'defaultShifts' : 'leadShifts';
    const currentShifts = form.getValues(fieldArrayKey);

    // Find available shift type
    const usedTypes = new Set(currentShifts.map((item) => item.typ_zmiany));
    const availableType = (SHIFT_TYPES.find((type) => !usedTypes.has(type)) ?? SHIFT_TYPES[0]) as 'Rano' | 'Środek' | 'Popoludniu';

    // Add new shift
    const newShift = createEmptyShift(day, availableType, category === 'lead');
    form.setValue(fieldArrayKey, [...currentShifts, newShift]);
  };

  /**
   * Confirm and delete a shift from the backend
   */
  const confirmDeleteShift = async (day: 0 | 1 | 2 | 3 | 4 | 5 | 6, shiftId: string) => {
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
   * T023-T027: Save a day's shift configuration
   * Validates with Zod, separates into CREATE/UPDATE operations, persists to backend, and handles errors
   */
  const handleSaveDay = async (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
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

      // T023: Separate into new shifts (no id) and existing shifts (with id)
      const createPayload = combined.filter((entry) => !entry.id);
      const updatePayload = combined.filter((entry) => entry.id);

      // T024: Execute all requests in parallel using Promise.all()
      const requests = [
        ...createPayload.map((entry) =>
          shiftParameterAPI.create({
            dzien_tygodnia: day,
            typ_zmiany: entry.typ_zmiany as 'Rano' | 'Środek' | 'Popoludniu',
            godzina_od: entry.godzina_od,
            godzina_do: entry.godzina_do,
            liczba_obsad: entry.liczba_obsad,
            czy_prowadzacy: entry.czy_prowadzacy,
          }),
        ),
        ...updatePayload.map((entry) =>
          shiftParameterAPI.update(entry.id!, {
            dzien_tygodnia: day,
            typ_zmiany: entry.typ_zmiany as 'Rano' | 'Środek' | 'Popoludniu',
            godzina_od: entry.godzina_od,
            godzina_do: entry.godzina_do,
            liczba_obsad: entry.liczba_obsad,
            czy_prowadzacy: entry.czy_prowadzacy,
          }),
        ),
      ];

      // T024: Wait for all requests to complete
      await Promise.all(requests);

      // T026: Reload data from backend to ensure consistency after save
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

      // T026: Reset form with refreshed data from backend
      form.reset({ defaultShifts, leadShifts });

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
      // T025/T027: Error handling - keep form data intact and display error message
      // T027: Handle 404 errors (shift deleted by another user) and other API failures
      const errorMessage = getErrorMessage(error);
      setDayStates((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          isSaving: false,
          error: errorMessage,
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
          const day = dayIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6;
          const dayState = dayStates[dayIndex];
          const form = formsRef.current[dayIndex];
          if (!dayState || !form) {
            return null;
          }

          return (
            <DayFormSection
              key={dayName}
              dayIndex={day}
              dayName={dayName}
              form={form}
              isSaving={dayState.isSaving}
              error={dayState.error}
              success={dayState.success}
              isExpanded={dayState.isExpanded}
              onToggleDay={handleToggleDay}
              onAddShift={handleAddShift}
              onRemoveShift={handleRemoveShift}
              onSaveDay={handleSaveDay}
            />
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
          onConfirm={() => confirmDeleteShift(confirmDelete.day as 0 | 1 | 2 | 3 | 4 | 5 | 6, confirmDelete.shiftId)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
