"use client";

import { useEffect, useState } from "react";

type DashboardMetrics = {
  month: string;
  total_employees: number;
  total_shifts: number;
  coverage_rate: number;
  employees_with_overtime: number;
  critical_alerts: number;
  warning_alerts: number;
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    employee_id?: number;
  }>;
};

type Absence = {
  id: number;
  employee_name: string;
  type: string;
  date_from: string;
  date_to: string;
  days_until: number;
};

const appEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

const API_BASE_URL = appEnv?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [metricsRes, absencesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/metrics`),
          fetch(`${API_BASE_URL}/api/dashboard/absences?days_ahead=30`),
        ]);

        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          setMetrics(metricsData);
        }

        if (absencesRes.ok) {
          const absencesData = await absencesRes.json();
          setAbsences(absencesData.absences || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-slate-600">Ładowanie danych...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Przegląd metryk grafiku, alerty i nadchodzące nieobecności
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      {metrics && (
        <section data-testid="metrics-section">
          <h2 className="text-lg font-medium text-slate-900 mb-4">
            Metryki - {metrics.month}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Pracownicy</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {metrics.total_employees}
              </p>
            </div>
            
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Zmiany</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {metrics.total_shifts}
              </p>
            </div>
            
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Pokrycie obsady</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {(metrics.coverage_rate * 100).toFixed(1)}%
              </p>
            </div>
            
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Nadgodziny</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {metrics.employees_with_overtime}
              </p>
              <p className="text-xs text-slate-500">pracowników</p>
            </div>
          </div>
        </section>
      )}

      {/* Alerts Section */}
      {metrics && metrics.alerts.length > 0 && (
        <section data-testid="alerts" className="alerts">
          <h2 className="text-lg font-medium text-slate-900 mb-4">
            Alerty i ostrzeżenia
          </h2>
          <div className="space-y-2">
            {metrics.alerts.slice(0, 10).map((alert, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-3 ${
                  alert.severity === "critical"
                    ? "border-red-200 bg-red-50 alert-critical"
                    : alert.severity === "warning"
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-blue-200 bg-blue-50"
                }`}
                data-severity={alert.severity}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                      alert.severity === "critical"
                        ? "bg-red-100 text-red-800"
                        : alert.severity === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {alert.severity === "critical"
                      ? "KRYTYCZNY"
                      : alert.severity === "warning"
                      ? "OSTRZEŻENIE"
                      : "INFO"}
                  </span>
                  <p className="flex-1 text-sm text-slate-700">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
          {metrics.alerts.length > 10 && (
            <p className="mt-3 text-sm text-slate-600">
              ... i jeszcze {metrics.alerts.length - 10} alerty(ów)
            </p>
          )}
        </section>
      )}

      {/* Upcoming Absences */}
      <section data-testid="absences-section" className="absences upcoming-absences">
        <h2 className="text-lg font-medium text-slate-900 mb-4">
          Nadchodzące nieobecności (30 dni)
        </h2>
        {absences.length === 0 ? (
          <div className="rounded-lg border bg-white p-6 text-center">
            <p className="text-sm text-slate-600">
              Brak zaplanowanych nieobecności w najbliższym czasie
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {absences.slice(0, 10).map((absence) => (
              <div
                key={absence.id}
                className="flex items-center justify-between rounded-lg border bg-white p-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {absence.employee_name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {absence.type} • {new Date(absence.date_from).toLocaleDateString("pl-PL")} -{" "}
                    {new Date(absence.date_to).toLocaleDateString("pl-PL")}
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {absence.days_until === 0
                    ? "Dziś"
                    : absence.days_until === 1
                    ? "Jutro"
                    : `Za ${absence.days_until} dni`}
                </span>
              </div>
            ))}
            {absences.length > 10 && (
              <p className="text-sm text-slate-600">
                ... i jeszcze {absences.length - 10} nieobecności
              </p>
            )}
          </div>
        )}
      </section>

      {!metrics && !loading && (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-sm text-slate-600">
            Brak dostępnych danych. Wygeneruj pierwszy grafik, aby zobaczyć metryki.
          </p>
        </div>
      )}
    </div>
  );
}
