"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { ParametryZmianTab } from "@/components/employees/ParametryZmianTab";
import { RegulyTab } from "@/components/employees/RegulyTab";

const appEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

const API_BASE_URL = appEnv?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

/**
 * Tab configuration for Settings page
 * Sekcje: Święta i dni specjalne, Parametry zmian, Reguły
 */
const SETTINGS_TABS = [
  { id: "swieta", label: "Święta i dni specjalne", component: "holidays" },
  { id: "parametry-zmian", label: "Parametry zmian", component: ParametryZmianTab },
  { id: "reguly", label: "Reguły", component: RegulyTab },
] as const;

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get active tab from query params, default to 'swieta'
  const activeTab = (searchParams.get("tab") as string) || "swieta";

  // Validate active tab exists
  const validatedTab = SETTINGS_TABS.find((t) => t.id === activeTab)?.id || "swieta";

  const handleTabChange = (tabId: string) => {
    // Update URL with new tab
    router.push(`/settings?tab=${tabId}`);
  };

  const [holidays, setHolidays] = useState<any[]>([]);
  const [holidayForm, setHolidayForm] = useState({ date: "", name: "", store_closed: false });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const holidaysRes = await fetch(`${API_BASE_URL}/api/swieta`);

        if (!holidaysRes.ok) throw new Error("Nie udało się pobrać listy świąt");

        setHolidays(await holidaysRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const refreshData = async () => {
    try {
      const holidaysRes = await fetch(`${API_BASE_URL}/api/swieta`);
      if (!holidaysRes.ok) {
        throw new Error("Nie udało się odświeżyć świąt");
      }
      setHolidays(await holidaysRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    }
  };

  // Obsługa formularza świąt
  const handleHolidayChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setHolidayForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const submitHoliday = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/swieta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holidayForm),
      });
      if (!response.ok) throw new Error("Nie udało się dodać święta");
      setHolidayForm({ date: "", name: "", store_closed: false });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ustawienia</h1>
          <p className="mt-2 text-gray-600">
            Zarządzaj parametrami zmian, regułami, świętami i wymaganiami obsadowymi
          </p>
        </div>

        {/* Tabs */}
        <Tabs.Root
          value={validatedTab}
          onValueChange={handleTabChange}
          className="rounded-lg bg-white shadow"
        >
          <Tabs.List className="flex border-b border-gray-200" aria-label="Settings tabs">
            {SETTINGS_TABS.map((tab) => (
              <Tabs.Trigger
                key={tab.id}
                value={tab.id}
                className="flex-1 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Tab Content */}
          <Tabs.Content value="swieta" className="p-6">
            <div className="space-y-10">
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Święta i dni specjalne</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={submitHoliday}>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Data*</span>
            <input
              name="date"
              type="date"
              value={holidayForm.date}
              onChange={handleHolidayChange}
              required
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Nazwa święta*</span>
            <input
              name="name"
              value={holidayForm.name}
              onChange={handleHolidayChange}
              required
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              name="store_closed"
              type="checkbox"
              checked={holidayForm.store_closed}
              onChange={handleHolidayChange}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="font-medium">Sklep zamknięty</span>
          </label>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {submitting ? "Zapisywanie..." : "Dodaj święto"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Zdefiniowane święta
          </h3>
          {loading ? (
            <p className="mt-3 text-sm text-slate-600">Ładowanie...</p>
          ) : holidays.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Brak zdefiniowanych świąt.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {holidays.map((holiday) => (
                <li
                  key={holiday.id}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-900">{holiday.name}</p>
                    <p className="text-xs text-slate-600">
                      {new Date(holiday.date).toLocaleDateString("pl-PL")}
                      {holiday.store_closed && " • Sklep zamknięty"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Usunąć to święto?")) {
                        try {
                          const response = await fetch(`${API_BASE_URL}/api/swieta/${holiday.id}`, {
                            method: "DELETE",
                          });
                          if (!response.ok && response.status !== 204) {
                            throw new Error("Nie udało się usunąć święta");
                          }
                          await refreshData();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
                        }
                      }
                    }}
                    className="text-xs font-semibold text-red-600 transition hover:text-red-700"
                  >
                    Usuń
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </Tabs.Content>

          {/* Parametry zmian Tab */}
          <Tabs.Content value="parametry-zmian" className="p-6">
            <ParametryZmianTab />
          </Tabs.Content>

          {/* Reguły Tab */}
          <Tabs.Content value="reguly" className="p-6">
            <RegulyTab />
          </Tabs.Content>
        </Tabs.Root>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Ustawienia &bull; Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}</p>
        </div>
      </div>
    </div>
  );
}
