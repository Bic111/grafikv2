'use client';

import { useState } from 'react';
import { useTauriQuery, useTauriMutation } from '@/lib/hooks/useTauri';
import { getAbsences, getEmployees, validateAndSaveAbsence, deleteAbsence } from '@/lib/db';
import type { Absence } from '@/lib/types';

const ABSENCE_TYPES = [
  { value: 'urlop', label: 'Urlop' },
  { value: 'zwolnienie', label: 'Zwolnienie lekarskie' },
  { value: 'urlop_okolicznosciowy', label: 'Urlop okolicznościowy' },
  { value: 'urlop_bezplatny', label: 'Urlop bezpłatny' },
  { value: 'inne', label: 'Inne' },
];

export default function AbsencesPage() {
  const [isAddingAbsence, setIsAddingAbsence] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch data
  const { data: absences, error: absencesError, isLoading: absencesLoading, refetch } = useTauriQuery(getAbsences);
  const { data: employees, error: employeesError, isLoading: employeesLoading } = useTauriQuery(getEmployees);

  // Mutations
  const { mutate: createAbsence, isLoading: isCreating } = useTauriMutation(validateAndSaveAbsence);
  const { mutate: removeAbsence, isLoading: isDeleting } = useTauriMutation(deleteAbsence);

  const handleAddAbsence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      setValidationErrors([]);

      const result = await createAbsence({
        employee_id: parseInt(formData.get('employee_id') as string),
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        type: formData.get('type') as string,
      });

      // Sprawdź wyniki walidacji
      if (result.result.errors.length > 0) {
        const errorMessages = result.result.errors.map((err) => err.message);
        setValidationErrors(errorMessages);

        // Jeśli są tylko ostrzeżenia, pozwól użytkownikowi zdecydować
        const hasCriticalErrors = result.result.errors.some((e) => e.severity === 'critical');
        if (hasCriticalErrors) {
          return;
        }

        // Jeśli są tylko ostrzeżenia i nieobecność została zapisana
        if (result.absence) {
          setIsAddingAbsence(false);
          refetch();
          (e.target as HTMLFormElement).reset();
        }
      } else {
        // Sukces bez błędów
        setIsAddingAbsence(false);
        refetch();
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      console.error('Błąd dodawania nieobecności:', err);
      setValidationErrors(['Nie udało się dodać nieobecności: ' + String(err)]);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć tę nieobecność?')) {
      return;
    }

    try {
      await removeAbsence(id);
      refetch();
    } catch (err) {
      console.error('Błąd usuwania nieobecności:', err);
      alert('Nie udało się usunąć nieobecności');
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees?.find((e) => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : `ID: ${employeeId}`;
  };

  const getAbsenceTypeLabel = (type: string) => {
    const absenceType = ABSENCE_TYPES.find((t) => t.value === type);
    return absenceType ? absenceType.label : type;
  };

  if (absencesLoading || employeesLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Zarządzanie Nieobecnościami</h1>
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (absencesError || employeesError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Zarządzanie Nieobecnościami</h1>
        <p className="text-red-600">Błąd: {(absencesError || employeesError)?.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zarządzanie Nieobecnościami</h1>
        <button
          onClick={() => {
            setIsAddingAbsence(true);
            setValidationErrors([]);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Dodaj Nieobecność
        </button>
      </div>

      {/* Add Absence Form */}
      {isAddingAbsence && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Nowa Nieobecność</h2>

          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="font-semibold text-red-800 mb-2">Błędy walidacji:</p>
              <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleAddAbsence} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pracownik <span className="text-red-600">*</span>
                </label>
                <select
                  name="employee_id"
                  required
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Wybierz pracownika</option>
                  {employees &&
                    employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.employment_type})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Typ Nieobecności <span className="text-red-600">*</span>
                </label>
                <select name="type" required className="w-full px-3 py-2 border rounded">
                  {ABSENCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data Rozpoczęcia <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data Zakończenia <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isCreating ? 'Dodawanie...' : 'Zapisz'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingAbsence(false);
                  setValidationErrors([]);
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Absences List */}
      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Pracownik</th>
              <th className="px-4 py-2 text-left">Typ</th>
              <th className="px-4 py-2 text-left">Od</th>
              <th className="px-4 py-2 text-left">Do</th>
              <th className="px-4 py-2 text-left">Długość</th>
              <th className="px-4 py-2 text-left">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {absences && absences.length > 0 ? (
              absences.map((absence) => {
                const startDate = new Date(absence.start_date);
                const endDate = new Date(absence.end_date);
                const days =
                  Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <tr key={absence.id} className="border-t">
                    <td className="px-4 py-2">{getEmployeeName(absence.employee_id)}</td>
                    <td className="px-4 py-2">{getAbsenceTypeLabel(absence.type)}</td>
                    <td className="px-4 py-2">{absence.start_date}</td>
                    <td className="px-4 py-2">{absence.end_date}</td>
                    <td className="px-4 py-2">{days} dni</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => absence.id && handleDelete(absence.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        Usuń
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Brak nieobecności. Dodaj pierwszą nieobecność powyżej.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
