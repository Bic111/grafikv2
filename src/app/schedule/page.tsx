'use client';

import { useState, useMemo } from 'react';
import { useTauriQuery, useTauriMutation } from '@/lib/hooks/useTauri';
import {
  getSchedule,
  getEmployees,
  getShifts,
  validateAndSaveScheduleEntry,
  getAbsences,
  updateScheduleEntry,
} from '@/lib/db';
import { runLocalSolver, runGeminiSolver } from '@/lib/solver';
import { exportScheduleCSV, exportSchedulePDFHtml, downloadCSV, printPDF } from '@/lib/exports';
import type { ScheduleEntry, Employee, Shift, SolverResult } from '@/lib/types';

// Pomocnicza funkcja do formatowania daty
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Pomocnicza funkcja do pobierania dni tygodnia
function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
}

const DAYS_OF_WEEK = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

export default function SchedulePage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Poniedziałek
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [selectedCell, setSelectedCell] = useState<{
    employeeId: number;
    date: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);
  const startDate = formatDate(weekDates[0]);
  const endDate = formatDate(weekDates[6]);

  // Fetch data
  const { data: schedule, refetch, isLoading: scheduleLoading } = useTauriQuery(
    () => getSchedule(startDate, endDate),
    [startDate, endDate]
  );
  const { data: employees, isLoading: employeesLoading } = useTauriQuery(getEmployees);
  const { data: shifts, isLoading: shiftsLoading } = useTauriQuery(getShifts);
  const { data: absences, isLoading: absencesLoading } = useTauriQuery(getAbsences);

  // Mutation
  const { mutate: saveEntry, isLoading: isSaving } = useTauriMutation(validateAndSaveScheduleEntry);

  const handlePreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const handleToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  const handleCellClick = (employeeId: number, date: string) => {
    setSelectedCell({ employeeId, date });
    setValidationErrors([]);
  };

  const handleAssignShift = async (shiftId: number) => {
    if (!selectedCell) return;

    try {
      setValidationErrors([]);

      // Sprawdź czy wpis już istnieje
      const existingEntry = schedule?.find(
        (e) =>
          e.employee_id === selectedCell.employeeId &&
          e.date === selectedCell.date &&
          e.shift_id === shiftId
      );

      if (existingEntry) {
        alert('Ta zmiana jest już przypisana do tego pracownika w tym dniu');
        return;
      }

      const result = await saveEntry({
        employee_id: selectedCell.employeeId,
        date: selectedCell.date,
        shift_id: shiftId,
      });

      // Sprawdź wyniki walidacji
      if (result.result.errors.length > 0) {
        const errorMessages = result.result.errors.map((err) => `[${err.severity.toUpperCase()}] ${err.message}`);
        setValidationErrors(errorMessages);

        // Jeśli są błędy krytyczne, nie zamykaj formularza
        const hasCriticalErrors = result.result.errors.some((e) => e.severity === 'critical');
        if (hasCriticalErrors) {
          return;
        }
      }

      // Sukces lub tylko ostrzeżenia
      setSelectedCell(null);
      setValidationErrors([]);
      refetch();
    } catch (err) {
      console.error('Błąd zapisywania wpisu:', err);
      setValidationErrors(['Błąd: ' + String(err)]);
    }
  };

  const handleGenerateLocal = async () => {
    try {
      setIsGenerating(true);
      setSolverResult(null);

      const result = await runLocalSolver(startDate, endDate);
      setSolverResult(result);

      // Jeśli solver znalazł rozwiązanie, zapisz przypisania
      if (result.status === 'OPTIMAL' || result.status === 'FEASIBLE') {
        for (const assignment of result.assignments) {
          try {
            await updateScheduleEntry(assignment);
          } catch (err) {
            console.error('Błąd zapisywania przypisania:', err);
          }
        }
        refetch();
      }
    } catch (err) {
      console.error('Błąd generowania grafiku:', err);
      setSolverResult({
        status: 'ERROR',
        assignments: [],
        warnings: [],
        errors: [String(err)],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateGemini = async () => {
    try {
      setIsGenerating(true);
      setSolverResult(null);

      const result = await runGeminiSolver(startDate, endDate);
      setSolverResult(result);

      // Jeśli solver znalazł rozwiązanie, zapisz przypisania
      if (result.status === 'OPTIMAL' || result.status === 'FEASIBLE') {
        for (const assignment of result.assignments) {
          try {
            await updateScheduleEntry(assignment);
          } catch (err) {
            console.error('Błąd zapisywania przypisania:', err);
          }
        }
        refetch();
      }
    } catch (err) {
      console.error('Błąd generowania grafiku:', err);
      setSolverResult({
        status: 'ERROR',
        assignments: [],
        warnings: [],
        errors: [String(err)],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      if (!schedule || !employees || !shifts) {
        alert('Brak danych do eksportu');
        return;
      }

      const csvContent = await exportScheduleCSV(schedule, employees, shifts);
      const filename = `grafik_${formatDate(weekDates[0])}_${formatDate(weekDates[6])}.csv`;
      downloadCSV(csvContent, filename);
    } catch (err) {
      console.error('Błąd eksportu CSV:', err);
      alert('Błąd podczas eksportu do CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      if (!schedule || !employees || !shifts) {
        alert('Brak danych do eksportu');
        return;
      }

      const startDate = formatDate(weekDates[0]);
      const endDate = formatDate(weekDates[6]);
      const htmlContent = await exportSchedulePDFHtml(schedule, employees, shifts, startDate, endDate);
      printPDF(htmlContent);
    } catch (err) {
      console.error('Błąd eksportu PDF:', err);
      alert('Błąd podczas eksportu do PDF');
    }
  };

  const getEntriesForCell = (employeeId: number, date: string): ScheduleEntry[] => {
    return schedule?.filter((e) => e.employee_id === employeeId && e.date === date) || [];
  };

  const getShiftById = (shiftId: number): Shift | undefined => {
    return shifts?.find((s) => s.id === shiftId);
  };

  const hasAbsence = (employeeId: number, date: string): boolean => {
    return (
      absences?.some(
        (a) => a.employee_id === employeeId && date >= a.start_date && date <= a.end_date
      ) || false
    );
  };

  const isLoading = scheduleLoading || employeesLoading || shiftsLoading || absencesLoading;

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Grafik Pracy</h1>
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Grafik Pracy</h1>

        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handlePreviousWeek}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Poprzedni tydzień
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Dzisiaj
          </button>
          <button
            onClick={handleNextWeek}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Następny tydzień →
          </button>
          <span className="text-lg font-semibold">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </span>

          <div className="flex-1"></div>

          <button
            onClick={handleGenerateLocal}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generowanie...' : '🔧 Generuj (Lokalnie)'}
          </button>
          <button
            onClick={handleGenerateGemini}
            disabled={isGenerating}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generowanie...' : '✨ Generuj (Gemini AI)'}
          </button>

          <div className="border-l border-gray-300 mx-2 h-8"></div>

          <button
            onClick={handleExportCSV}
            disabled={!schedule || schedule.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            📊 Eksportuj CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={!schedule || schedule.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            📄 Drukuj PDF
          </button>
        </div>

        {/* Solver Result Display */}
        {solverResult && (
          <div
            className={`mb-4 p-4 rounded ${
              solverResult.status === 'OPTIMAL' || solverResult.status === 'FEASIBLE'
                ? 'bg-green-50 border border-green-200'
                : solverResult.status === 'INFEASIBLE'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">
                {solverResult.status === 'OPTIMAL' && '✅ Znaleziono optymalne rozwiązanie'}
                {solverResult.status === 'FEASIBLE' && '✅ Znaleziono rozwiązanie dopuszczalne'}
                {solverResult.status === 'INFEASIBLE' && '⚠️ Nie znaleziono rozwiązania'}
                {solverResult.status === 'ERROR' && '❌ Błąd generowania'}
              </h3>
              <button
                onClick={() => setSolverResult(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {solverResult.assignments.length > 0 && (
              <p className="text-sm mb-2">
                Dodano {solverResult.assignments.length} przypisań do grafiku.
              </p>
            )}

            {solverResult.warnings.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold text-yellow-800 text-sm">Ostrzeżenia:</p>
                <ul className="list-disc list-inside text-yellow-700 text-sm">
                  {solverResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {solverResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold text-red-800 text-sm">Błędy:</p>
                <ul className="list-disc list-inside text-red-700 text-sm">
                  {solverResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assign Shift Modal */}
      {selectedCell && (
        <div className="mb-6 p-4 border-2 border-blue-500 rounded bg-blue-50">
          <h2 className="text-lg font-semibold mb-3">
            Przypisz zmianę:{' '}
            {employees?.find((e) => e.id === selectedCell.employeeId)?.first_name}{' '}
            {employees?.find((e) => e.id === selectedCell.employeeId)?.last_name} -{' '}
            {selectedCell.date}
          </h2>

          {validationErrors.length > 0 && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-semibold text-yellow-800 mb-1">Komunikaty walidacji:</p>
              <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {shifts &&
              shifts
                .filter((s) => {
                  const date = new Date(selectedCell.date);
                  return s.day_of_week === date.getDay();
                })
                .map((shift) => (
                  <button
                    key={shift.id}
                    onClick={() => shift.id && handleAssignShift(shift.id)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {shift.start_time} - {shift.end_time}
                  </button>
                ))}
          </div>

          <button
            onClick={() => {
              setSelectedCell(null);
              setValidationErrors([]);
            }}
            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Anuluj
          </button>
        </div>
      )}

      {/* Schedule Grid */}
      <div className="border rounded overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left sticky left-0 bg-gray-100 z-10 border-r">
                Pracownik
              </th>
              {weekDates.map((date, index) => (
                <th key={index} className="px-4 py-2 text-center min-w-[120px]">
                  <div>{DAYS_OF_WEEK[date.getDay()]}</div>
                  <div className="text-sm font-normal text-gray-600">{formatDate(date)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees && employees.length > 0 ? (
              employees
                .filter((e) => e.status === 'active')
                .map((employee) => (
                  <tr key={employee.id} className="border-t">
                    <td className="px-4 py-2 sticky left-0 bg-white z-10 border-r">
                      <div className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </div>
                      <div className="text-sm text-gray-600">{employee.employment_type}</div>
                    </td>
                    {weekDates.map((date, index) => {
                      const dateStr = formatDate(date);
                      const entries = getEntriesForCell(employee.id!, dateStr);
                      const isAbsent = hasAbsence(employee.id!, dateStr);

                      return (
                        <td
                          key={index}
                          onClick={() => !isAbsent && employee.id && handleCellClick(employee.id, dateStr)}
                          className={`px-2 py-2 text-center cursor-pointer border-l ${
                            isAbsent
                              ? 'bg-red-100 cursor-not-allowed'
                              : selectedCell?.employeeId === employee.id &&
                                selectedCell?.date === dateStr
                              ? 'bg-blue-100 ring-2 ring-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {isAbsent ? (
                            <div className="text-red-600 text-sm font-semibold">Nieobecność</div>
                          ) : entries.length > 0 ? (
                            <div className="space-y-1">
                              {entries.map((entry) => {
                                const shift = entry.shift_id && getShiftById(entry.shift_id);
                                return shift ? (
                                  <div
                                    key={entry.id}
                                    className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                                  >
                                    {shift.start_time} - {shift.end_time}
                                  </div>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Brak pracowników. Dodaj pracowników w sekcji Ustawienia → Pracownicy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Legenda:</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Przypisana zmiana</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>Nieobecność</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded"></div>
            <span>Zaznaczona komórka</span>
          </div>
        </div>
      </div>
    </div>
  );
}
