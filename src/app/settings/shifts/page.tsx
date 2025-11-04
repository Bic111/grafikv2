'use client';

import { useState, useEffect } from 'react';
import { useTauriQuery, useTauriMutation } from '@/lib/hooks/useTauri';
import { getShifts, updateShifts } from '@/lib/db';
import type { Shift } from '@/lib/types';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Poniedziałek' },
  { value: 2, label: 'Wtorek' },
  { value: 3, label: 'Środa' },
  { value: 4, label: 'Czwartek' },
  { value: 5, label: 'Piątek' },
  { value: 6, label: 'Sobota' },
  { value: 0, label: 'Niedziela' },
];

interface ShiftFormData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  required_staff: number;
}

export default function ShiftsPage() {
  const [shiftsByDay, setShiftsByDay] = useState<Record<number, ShiftFormData[]>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch shifts
  const { data: shifts, error, isLoading, refetch } = useTauriQuery(getShifts);

  // Update shifts mutation
  const { mutate: saveShifts, isLoading: isSaving } = useTauriMutation(updateShifts);

  // Initialize shifts by day when data is loaded
  useEffect(() => {
    if (shifts) {
      const grouped: Record<number, ShiftFormData[]> = {};

      // Initialize all days with empty arrays
      DAYS_OF_WEEK.forEach((day) => {
        grouped[day.value] = [];
      });

      // Group existing shifts by day
      shifts.forEach((shift) => {
        if (!grouped[shift.day_of_week]) {
          grouped[shift.day_of_week] = [];
        }
        grouped[shift.day_of_week].push({
          day_of_week: shift.day_of_week,
          start_time: shift.start_time,
          end_time: shift.end_time,
          required_staff: shift.required_staff,
        });
      });

      setShiftsByDay(grouped);
      setHasChanges(false);
    }
  }, [shifts]);

  const addShiftToDay = (dayOfWeek: number) => {
    setShiftsByDay((prev) => ({
      ...prev,
      [dayOfWeek]: [
        ...(prev[dayOfWeek] || []),
        {
          day_of_week: dayOfWeek,
          start_time: '08:00',
          end_time: '16:00',
          required_staff: 1,
        },
      ],
    }));
    setHasChanges(true);
  };

  const removeShiftFromDay = (dayOfWeek: number, index: number) => {
    setShiftsByDay((prev) => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek].filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const updateShift = (dayOfWeek: number, index: number, field: keyof ShiftFormData, value: any) => {
    setShiftsByDay((prev) => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek].map((shift, i) =>
        i === index ? { ...shift, [field]: value } : shift
      ),
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Flatten all shifts into a single array
      const allShifts: Omit<Shift, 'id'>[] = [];

      Object.entries(shiftsByDay).forEach(([day, dayShifts]) => {
        dayShifts.forEach((shift) => {
          allShifts.push({
            day_of_week: parseInt(day),
            start_time: shift.start_time,
            end_time: shift.end_time,
            required_staff: shift.required_staff,
          });
        });
      });

      await saveShifts(allShifts);
      setHasChanges(false);
      refetch();
      alert('Zmiany zostały zapisane pomyślnie!');
    } catch (err) {
      console.error('Błąd zapisywania zmian:', err);
      alert('Nie udało się zapisać zmian');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Konfiguracja Zmian</h1>
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Konfiguracja Zmian</h1>
        <p className="text-red-600">Błąd: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Konfiguracja Zmian</h1>
          <p className="text-gray-600 mt-1">
            Zdefiniuj zmiany dla każdego dnia tygodnia. Możesz dodać wiele zmian na dzień.
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? 'Zapisywanie...' : 'Zapisz Zmiany'}
          </button>
        )}
      </div>

      <div className="space-y-6">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day.value} className="border rounded p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{day.label}</h2>
              <button
                onClick={() => addShiftToDay(day.value)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Dodaj Zmianę
              </button>
            </div>

            {shiftsByDay[day.value] && shiftsByDay[day.value].length > 0 ? (
              <div className="space-y-3">
                {shiftsByDay[day.value].map((shift, index) => (
                  <div key={index} className="flex gap-4 items-center p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Od</label>
                      <input
                        type="time"
                        value={shift.start_time}
                        onChange={(e) =>
                          updateShift(day.value, index, 'start_time', e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Do</label>
                      <input
                        type="time"
                        value={shift.end_time}
                        onChange={(e) =>
                          updateShift(day.value, index, 'end_time', e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs text-gray-600 mb-1">Liczba osób</label>
                      <input
                        type="number"
                        min="1"
                        value={shift.required_staff}
                        onChange={(e) =>
                          updateShift(
                            day.value,
                            index,
                            'required_staff',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <button
                      onClick={() => removeShiftFromDay(day.value, index)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      title="Usuń zmianę"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Brak zmian. Kliknij "Dodaj Zmianę" aby dodać.
              </p>
            )}
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Uwaga:</strong> Masz niezapisane zmiany. Pamiętaj o kliknięciu "Zapisz Zmiany"
            przed opuszczeniem strony.
          </p>
        </div>
      )}
    </div>
  );
}
