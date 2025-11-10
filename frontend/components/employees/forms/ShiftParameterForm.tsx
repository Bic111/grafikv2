import React from 'react';
import { SHIFT_TYPES } from '@/types';

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
  value: ShiftParameterFormValue;
  onChange: (value: ShiftParameterFormValue) => void;
  onRemove?: () => void;
  disabled?: boolean;
  isLead?: boolean;
  label?: string;
  error?: string | null;
  disableShiftType?: boolean;
}

export function ShiftParameterForm({
  value,
  onChange,
  onRemove,
  disabled = false,
  isLead = false,
  label,
  error,
  disableShiftType = false,
}: ShiftParameterFormProps): JSX.Element {
  const handleFieldChange = <K extends keyof ShiftParameterFormValue>(
    field: K,
  ) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>,
    ) => {
      const nextValue = (() => {
        if (field === 'liczba_obsad') {
          const parsed = Number(event.target.value);
          return Number.isNaN(parsed) ? 0 : parsed;
        }

        return event.target.value;
      })();

      onChange({
        ...value,
        [field]: nextValue,
      } as ShiftParameterFormValue);
    };

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${
        disabled ? 'opacity-80' : ''
      }`}
    >
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {label ?? value.typ_zmiany}
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
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">
            Typ zmiany
          </label>
          <select
            value={value.typ_zmiany}
            onChange={handleFieldChange('typ_zmiany')}
            disabled={disabled || disableShiftType}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {SHIFT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">
            Godzina od
          </label>
          <input
            type="time"
            value={value.godzina_od}
            onChange={handleFieldChange('godzina_od')}
            disabled={disabled}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">
            Godzina do
          </label>
          <input
            type="time"
            value={value.godzina_do}
            onChange={handleFieldChange('godzina_do')}
            disabled={disabled}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">
            Liczba pracowników
          </label>
          <input
            type="number"
            min={0}
            value={value.liczba_obsad}
            onChange={handleFieldChange('liczba_obsad')}
            disabled={disabled}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
