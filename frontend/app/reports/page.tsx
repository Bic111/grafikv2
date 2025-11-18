"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type ReportData = {
  schedule: string;
  metadata?: {
    generated_at: string;
    month: string;
  };
  working_minutes: Record<
    string,
    {
      pracownik: string;
      rola: string | null;
      minuty: number;
    }
  >;
  minutes_per_role?: Record<string, number>;
  coverage?: {
    total_shifts: number;
    coverage_rate: number;
    coverage_issues: Array<{
      date: string;
      shift_id: number;
      role_id: number;
      required: number;
      actual: number;
      severity: string;
    }>;
  };
  overtime?: {
    employees_with_overtime: number;
    details: Array<{
      employee_id: number;
      employee_name: string;
      total_hours: number;
      limit_hours: number;
      overtime_hours: number;
    }>;
  };
  alerts?: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
};

const appEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

const API_BASE_URL = appEnv?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export default function ReportsPage() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async (selectedMonth: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/raporty?month=${selectedMonth}&enhanced=true`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Nie znaleziono grafiku dla wybranego miesiąca");
        }
        throw new Error("Nie udało się pobrać raportu");
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport(month);
  }, [month]);

  const handleMonthChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMonth(event.target.value);
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/raporty?month=${month}&enhanced=true&format=${format}`
      );

      if (!response.ok) {
        throw new Error("Nie udało się wyeksportować raportu");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `raport_${month}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas eksportu");
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Raporty</h1>
        <p className="text-sm text-slate-600">
          Przeglądaj i eksportuj szczegółowe raporty z grafików
        </p>
      </header>

      {/* Month Filter */}
      <section className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <span>Miesiąc:</span>
          <input
            type="month"
            value={month}
            onChange={handleMonthChange}
            className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport("csv")}
            disabled={!report || loading}
            className="inline-flex items-center rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
          >
            Eksportuj CSV
          </button>
          <button
            onClick={() => handleExport("json")}
            disabled={!report || loading}
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            Eksportuj JSON
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8">
          <p className="text-lg text-slate-600">Ładowanie raportu...</p>
        </div>
      )}

      {!loading && report && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Pracownicy</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {Object.keys(report.working_minutes).length}
              </p>
            </div>

            {report.coverage && (
              <>
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-sm font-medium text-slate-600">Pokrycie obsady</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {(report.coverage.coverage_rate * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-sm font-medium text-slate-600">Problemy z obsadą</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {report.coverage.coverage_issues.length}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Working Hours Table */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              Przepracowane godziny
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="pb-3 text-left font-medium text-slate-600">Pracownik</th>
                    <th className="pb-3 text-left font-medium text-slate-600">Rola</th>
                    <th className="pb-3 text-right font-medium text-slate-600">Godziny</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.working_minutes).map(([id, data]) => (
                    <tr key={id} className="border-b last:border-0">
                      <td className="py-3 text-slate-900">{data.pracownik}</td>
                      <td className="py-3 text-slate-600">{data.rola || "-"}</td>
                      <td className="py-3 text-right font-medium text-slate-900">
                        {(data.minuty / 60).toFixed(2)}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Overtime Section */}
          {report.overtime && report.overtime.details.length > 0 && (
            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-medium text-slate-900 mb-4">
                Nadgodziny ({report.overtime.employees_with_overtime} pracowników)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="pb-3 text-left font-medium text-slate-600">Pracownik</th>
                      <th className="pb-3 text-right font-medium text-slate-600">Suma godzin</th>
                      <th className="pb-3 text-right font-medium text-slate-600">Limit</th>
                      <th className="pb-3 text-right font-medium text-slate-600">Nadgodziny</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.overtime.details.map((ot) => (
                      <tr key={ot.employee_id} className="border-b last:border-0">
                        <td className="py-3 text-slate-900">{ot.employee_name}</td>
                        <td className="py-3 text-right text-slate-600">{ot.total_hours}h</td>
                        <td className="py-3 text-right text-slate-600">{ot.limit_hours}h</td>
                        <td className="py-3 text-right font-medium text-red-600">
                          +{ot.overtime_hours}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Coverage Issues */}
          {report.coverage && report.coverage.coverage_issues.length > 0 && (
            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-medium text-slate-900 mb-4">
                Problemy z obsadą ({report.coverage.coverage_issues.length})
              </h2>
              <div className="space-y-2">
                {report.coverage.coverage_issues.slice(0, 20).map((issue, idx) => (
                  <div
                    key={idx}
                    className={`rounded border p-3 ${
                      issue.severity === "critical"
                        ? "border-red-200 bg-red-50"
                        : "border-yellow-200 bg-yellow-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {new Date(issue.date).toLocaleDateString("pl-PL")} - Zmiana #{issue.shift_id}
                        </p>
                        <p className="text-sm text-slate-600">
                          Rola #{issue.role_id}: {issue.actual} / {issue.required} wymagane
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          issue.severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {issue.severity === "critical" ? "KRYTYCZNY" : "OSTRZEŻENIE"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Alerts */}
          {report.alerts && report.alerts.length > 0 && (
            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-medium text-slate-900 mb-4">
                Alerty ({report.alerts.length})
              </h2>
              <div className="space-y-2">
                {report.alerts.slice(0, 15).map((alert, idx) => (
                  <div
                    key={idx}
                    className={`rounded border p-3 ${
                      alert.severity === "critical"
                        ? "border-red-200 bg-red-50"
                        : alert.severity === "warning"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <p className="text-sm text-slate-700">{alert.message}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {!loading && !report && !error && (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-sm text-slate-600">
            Brak raportu dla wybranego miesiąca. Wybierz inny miesiąc lub wygeneruj nowy grafik.
          </p>
        </div>
      )}
    </div>
  );
}
