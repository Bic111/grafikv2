"use client";

import { useEffect, useMemo, useState } from "react";
import CalendarView from "../../components/CalendarView";
import GeneratorPanel from "../../components/GeneratorPanel";
import MonthNavigator from "../../components/MonthNavigator";
import Legend from "../../components/Legend";
import { fetchShiftParameters, ShiftParameter } from "../../services/api/shiftParameters";

// ... (reszta typów bez zmian)
type ScheduleIssue = {
  level: string;
  message: string;
  rule_code?: string;
};

type ScheduleDiagnostics = {
  generator_type: string;
  scenario_type?: string;
  runtime_ms: number;
  entry_count: number;
  issue_count: number;
  blocking_issues: number;
  warning_issues: number;
};

type Shift = {
  id: number;
  nazwa_zmiany: string;
  godzina_rozpoczecia: string | null;
  godzina_zakonczenia: string | null;
};

type ScheduleEntry = {
  id: number;
  data: string;
  zmiana: string | null;
  zmiana_id: number;
  pracownik_id: number;
  pracownik: {
    imie: string | null;
    nazwisko: string | null;
    rola: string | null;
  } | null;
};

type Absence = {
  id: number;
  pracownik_id: number;
  typ_nieobecnosci: string;
  data_od: string;
  data_do: string;
};

type ScheduleResponse = {
  id: number;
  miesiac_rok: string;
  status: string;
  entries: ScheduleEntry[];
  issues?: ScheduleIssue[];
  diagnostics?: ScheduleDiagnostics;
  shifts: Shift[];
  absences: Absence[];
};

const appEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

const API_BASE_URL = appEnv?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";


export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState('');
  const [shiftParams, setShiftParams] = useState<ShiftParameter[] | null>(null);

  // ... (reszta hooków i logiki bez zmian)
  const [draggedEntryId, setDraggedEntryId] = useState<number | null>(null);
  
  useEffect(() => {
    // Ta funkcja teraz będzie ładować grafik dla `currentDisplayMonth`
    const load = async (month: string) => {
      if (!month) return; // Nie wykonuj zapytania, jeśli miesiąc jest pusty
      setLoading(true);
      setError(null);
      try {
        // Używamy endpointu do pobierania grafiku dla konkretnego miesiąca
        const response = await fetch(`${API_BASE_URL}/api/grafiki/miesiac/${month}`);
        if (!response.ok) {
          const problem = await response.json().catch(() => null);
          setSchedule(null);
          setEntries([]);
          throw new Error(problem?.message ?? `Brak grafiku dla ${month}`);
        }
        const data = (await response.json()) as ScheduleResponse;
        setSchedule(data);
        setEntries(data.entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      } finally {
        setLoading(false);
      }
    };

    // Wywołujemy funkcję `load` za każdym razem, gdy zmienia się `currentDisplayMonth`
    void load(currentDisplayMonth);
  }, [currentDisplayMonth]);

  // Drugi useEffect do załadowania danych początkowych (tylko raz)
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        // Równolegle pobierz parametry zmian
        const [resp, params] = await Promise.all([
          fetch(`${API_BASE_URL}/api/grafiki/ostatni`),
          fetchShiftParameters(),
        ]);
        if (!resp.ok) {
          const problem = await response.json().catch(() => null);
          throw new Error(problem?.message ?? "Brak grafiku do wyświetlenia");
        }
        const data = (await resp.json()) as ScheduleResponse;
        setSchedule(data);
        setEntries(data.entries);
        setCurrentDisplayMonth(data.miesiac_rok); // To wywoła pierwszy useEffect
        setShiftParams(params);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      } finally {
        setLoading(false);
      }
    };
    // Uruchamiamy tylko raz, przy pierwszym załadowaniu komponentu
    loadInitial();
  }, []); // Pusta tablica - wykonanie tylko raz przy mount


  const handleGenerate = async (year: number, month: number, generatorType: string, scenarioType?: string) => {
    console.log(`Generowanie grafiku dla: ${year}-${month} z ${generatorType}`);
    setLoading(true);
    setError(null);
    try {
        const response = await fetch(`${API_BASE_URL}/api/grafiki/generuj`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              year: year, 
              month: month, 
              generator_type: generatorType,
              scenario_type: generatorType === 'ortools' ? scenarioType : undefined
            }),
        });
        if (!response.ok) {
          const problem = await response.json().catch(() => null);
          // Wzbogacony komunikat błędu o szczegóły z backendu
          const base = problem?.message ?? 'Błąd podczas generowania grafiku';
          const details = problem?.error ? `: ${problem.error}` : '';
          throw new Error(base + details);
        }
        // Po udanym wygenerowaniu, odświeżamy dane
        const data = await response.json();
        setSchedule(data);
        setEntries(data.entries);
        setCurrentDisplayMonth(data.miesiac_rok);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
    } finally {
        setLoading(false);
    }
  };
  
  const handlePrevMonth = () => {
    if (!currentDisplayMonth) return;
    const currentDate = new Date(`${currentDisplayMonth}-02`);
    currentDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDisplayMonth(currentDate.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    if (!currentDisplayMonth) return;
    const currentDate = new Date(`${currentDisplayMonth}-02`);
    currentDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDisplayMonth(currentDate.toISOString().slice(0, 7));
  };


  const shiftMap = useMemo(() => {
    if (!schedule) {
      return new Map<number, Shift>();
    }
    return new Map(schedule.shifts.map((shift) => [shift.id, shift]));
  }, [schedule]);

  const grouped = useMemo(() => {
    if (!schedule) {
      return [] as {
        date: string;
        shifts: { shift: Shift; entries: ScheduleEntry[] }[];
      }[];
    }

    const byDate: Record<string, Record<number, ScheduleEntry[]>> = {};
    for (const entry of entries) {
      if (!byDate[entry.data]) {
        byDate[entry.data] = {};
      }
      if (!byDate[entry.data][entry.zmiana_id]) {
        byDate[entry.data][entry.zmiana_id] = [];
      }
      byDate[entry.data][entry.zmiana_id].push(entry);
    }

    const dates = Array.from(new Set(entries.map((entry) => entry.data))).sort();

    return dates.map((date) => ({
      date,
      shifts: schedule.shifts.map((shift) => ({
        shift,
        entries: (byDate[date]?.[shift.id] ?? []).slice().sort((a, b) => {
          const aName = `${a.pracownik?.nazwisko ?? ""}${a.pracownik?.imie ?? ""}`;
          const bName = `${b.pracownik?.nazwisko ?? ""}${b.pracownik?.imie ?? ""}`;
          return aName.localeCompare(bName);
        }),
      })),
    }));
  }, [entries, schedule]);

  const handleDrop = (targetDate: string, shiftId: number) => {
    if (draggedEntryId === null) {
      return;
    }
    const shiftName = shiftMap.get(shiftId)?.nazwa_zmiany ?? null;
    setEntries((current) =>
      current.map((entry) =>
        entry.id === draggedEntryId
          ? { ...entry, data: targetDate, zmiana_id: shiftId, zmiana: shiftName }
          : entry,
      ),
    );
    setDraggedEntryId(null);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <GeneratorPanel onGenerate={handleGenerate} />
      
      {/* Diagnostics Panel */}
      {schedule?.diagnostics && (
        <div className="bg-gray-800 p-3 rounded-lg mb-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-gray-400">Algorytm: </span>
                <span className="text-white font-medium">
                  {schedule.diagnostics.generator_type === 'heuristic' ? 'Heurystyczny' : 'OR-Tools'}
                </span>
              </div>
              {schedule.diagnostics.scenario_type && (
                <div>
                  <span className="text-gray-400">Scenariusz: </span>
                  <span className="text-white font-medium">
                    {schedule.diagnostics.scenario_type === 'balanced' && 'Zbalansowany'}
                    {schedule.diagnostics.scenario_type === 'minimize_work' && 'Minimalizuj pracę'}
                    {schedule.diagnostics.scenario_type === 'maximize_coverage' && 'Maksymalizuj pokrycie'}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-400">Czas: </span>
                <span className="text-white font-medium">{schedule.diagnostics.runtime_ms} ms</span>
              </div>
              <div>
                <span className="text-gray-400">Wpisów: </span>
                <span className="text-white font-medium">{schedule.diagnostics.entry_count}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`${schedule.diagnostics.blocking_issues > 0 ? 'text-red-400' : 'text-green-400'} font-medium`}>
                ⊗ {schedule.diagnostics.blocking_issues} błędów
              </div>
              <div className={`${schedule.diagnostics.warning_issues > 0 ? 'text-yellow-400' : 'text-green-400'} font-medium`}>
                ⚠ {schedule.diagnostics.warning_issues} ostrzeżeń
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issues Panel */}
      {schedule?.issues && schedule.issues.length > 0 && (
        <div className="bg-gray-800 p-3 rounded-lg mb-3 max-h-32 overflow-y-auto">
          <div className="text-sm space-y-1">
            {schedule.issues.map((issue, index) => (
              <div 
                key={`${issue.level}-${index}`}
                className={`flex items-start space-x-2 ${
                  issue.level === 'error' ? 'text-red-400' : 'text-yellow-400'
                }`}
              >
                <span className="font-bold mt-0.5">{issue.level === 'error' ? '⊗' : '⚠'}</span>
                <span>
                  {issue.rule_code && <span className="font-mono text-xs mr-1">[{issue.rule_code}]</span>}
                  {issue.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 p-3 rounded-lg mb-4 flex items-center justify-between">
        <MonthNavigator 
          currentMonth={currentDisplayMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        <Legend />
      </div>
      
      {loading ? (
        <p className="text-center">Ładowanie grafiku...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <CalendarView 
          scheduleData={grouped}
          onDrop={handleDrop}
          onDragStart={setDraggedEntryId}
          onDragEnd={() => setDraggedEntryId(null)}
          shiftParams={shiftParams ?? []}
        />
      )}
    </div>
  );
}
