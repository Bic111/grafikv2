"use client";

import { useEffect, useMemo, useState } from "react";

type ScheduleIssue = {
  level: string;
  message: string;
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
  shifts: Shift[];
  absences: Absence[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

const formatShiftTime = (shift: Shift) => {
  if (!shift.godzina_rozpoczecia || !shift.godzina_zakonczenia) {
    return "";
  }
  return `${shift.godzina_rozpoczecia.slice(0, 5)}–${shift.godzina_zakonczenia.slice(0, 5)}`;
};

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [draggedEntryId, setDraggedEntryId] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/grafiki/ostatni`);
        if (!response.ok) {
          const problem = await response.json().catch(() => null);
          throw new Error(problem?.message ?? "Brak grafiku do wyświetlenia");
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

    void load();
  }, []);

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

  const issues = schedule?.issues ?? [];

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
    setDirty(true);
    setFeedback(null);
    setSaveError(null);
  };

  const onSave = async () => {
    if (!schedule) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/grafiki/${schedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: schedule.status,
          entries: entries.map((entry) => ({
            id: entry.id,
            data: entry.data,
            zmiana_id: entry.zmiana_id,
            pracownik_id: entry.pracownik_id,
          })),
        }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.message ?? "Nie udało się zapisać zmian");
      }

      const data = (await response.json()) as ScheduleResponse;
      setSchedule(data);
      setEntries(data.entries);
      setDirty(false);
      setFeedback("Zmiany zostały zapisane");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Wystąpił nieznany błąd podczas zapisywania");
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    if (!schedule) {
      return;
    }
    setEntries(schedule.entries);
    setDirty(false);
    setSaveError(null);
    setFeedback(null);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Grafik pracy</h1>
        <p className="text-sm text-slate-600">
          Przeciągaj pracowników pomiędzy zmianami, a następnie zapisz zmiany, aby zaktualizować
          grafik.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-slate-600">Ładowanie grafiku...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !schedule ? (
        <p className="text-sm text-slate-600">Brak danych do wyświetlenia.</p>
      ) : (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-600">
              Miesiąc: {schedule.miesiac_rok}
            </span>
            <button
              type="button"
              className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              onClick={onSave}
              disabled={!dirty || saving}
            >
              {saving ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>
            <button
              type="button"
              className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
              onClick={onReset}
              disabled={!dirty || saving}
            >
              Odrzuć zmiany
            </button>
            {dirty && !saving && (
              <span className="text-xs font-medium uppercase text-amber-600">
                Niezapisane zmiany
              </span>
            )}
          </div>

          {feedback && <p className="text-sm text-green-600">{feedback}</p>}
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}

          {issues.length > 0 && !dirty && (
            <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Ostrzeżenia dla aktualnego grafiku:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {issues.map((issue, index) => (
                  <li key={`${issue.level}-${index}`}>
                    <span className="font-semibold uppercase">{issue.level}</span> – {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-6">
            {grouped.length === 0 && (
              <p className="text-sm text-slate-600">Brak przypisanych zmian w bieżącym grafiku.</p>
            )}
            {grouped.map(({ date, shifts }) => (
              <div key={date} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">
                  {new Date(date).toLocaleDateString("pl-PL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {shifts.map(({ shift, entries: shiftEntries }) => (
                    <div
                      key={shift.id}
                      className="rounded border border-dashed border-slate-300 bg-slate-50 p-3"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        handleDrop(date, shift.id);
                      }}
                    >
                      <div className="space-y-0.5 text-sm">
                        <p className="font-medium text-slate-800">{shift.nazwa_zmiany}</p>
                        <p className="text-xs text-slate-500">{formatShiftTime(shift) || ""}</p>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {shiftEntries.map((entry) => (
                          <li
                            key={entry.id}
                            draggable
                            onDragStart={() => setDraggedEntryId(entry.id)}
                            onDragEnd={() => setDraggedEntryId(null)}
                            className="cursor-move rounded border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:border-blue-500"
                          >
                            <p className="font-medium text-slate-900">
                              {entry.pracownik?.imie} {entry.pracownik?.nazwisko}
                            </p>
                            <p className="text-xs text-slate-500">{entry.pracownik?.rola ?? "brak roli"}</p>
                          </li>
                        ))}
                        {shiftEntries.length === 0 && (
                          <li className="rounded border border-slate-200 bg-white px-3 py-4 text-center text-xs text-slate-400">
                            Przeciągnij tu pracownika
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
