"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Employee = {
  id: number;
  imie: string;
  nazwisko: string;
  rola_id: number | null;
  etat: string | null;
  limit_godzin_miesieczny: number | null;
  preferencje: unknown;
  data_zatrudnienia: string | null;
};

type Role = {
  id: number;
  nazwa_roli: string;
};

const appEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

const API_BASE_URL = appEnv?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

const emptyForm = {
  imie: "",
  nazwisko: "",
  rola_id: "",
  etat: "",
  limit_godzin_miesieczny: "",
  data_zatrudnienia: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [preferencesForm, setPreferencesForm] = useState({ preferredOffDays: "", preferredShifts: "", avoidShifts: "", maxWeeklyHours: "" });
  
  const handlePreferencesChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setPreferencesForm((current) => ({ ...current, [name]: value }));
  };

  const submitPreferences = async (employeeId: number) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        preferencje: {
          preferredOffDays: preferencesForm.preferredOffDays.split(",").map((d) => d.trim()).filter(Boolean),
          preferredShifts: preferencesForm.preferredShifts.split(",").map((s) => s.trim()).filter(Boolean),
          avoidShifts: preferencesForm.avoidShifts.split(",").map((s) => s.trim()).filter(Boolean),
          maxWeeklyHours: preferencesForm.maxWeeklyHours ? Number(preferencesForm.maxWeeklyHours) : undefined,
        },
      };
      const response = await fetch(`${API_BASE_URL}/api/pracownicy/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Nie udało się zapisać preferencji");
      setPreferencesForm({ preferredOffDays: "", preferredShifts: "", avoidShifts: "", maxWeeklyHours: "" });
      setSelectedEmployeeId(null);
      await refreshEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setSubmitting(false);
    }
  };
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = useMemo(
    () => [...roles].sort((a, b) => a.nazwa_roli.localeCompare(b.nazwa_roli)),
    [roles],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [employeesRes, rolesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/pracownicy`),
          fetch(`${API_BASE_URL}/api/role`),
        ]);

        if (!employeesRes.ok) {
          throw new Error("Nie udało się pobrać listy pracowników");
        }

        if (!rolesRes.ok) {
          throw new Error("Nie udało się pobrać listy ról");
        }

        const employeesData = (await employeesRes.json()) as Employee[];
        const rolesData = (await rolesRes.json()) as Role[];
        setEmployees(employeesData);
        setRoles(rolesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const refreshEmployees = async () => {
    const response = await fetch(`${API_BASE_URL}/api/pracownicy`);
    if (!response.ok) {
      throw new Error("Nie udało się odświeżyć listy pracowników");
    }
    const data = (await response.json()) as Employee[];
    setEmployees(data);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      imie: form.imie.trim(),
      nazwisko: form.nazwisko.trim(),
      etat: form.etat || null,
      data_zatrudnienia: form.data_zatrudnienia || null,
    };

    if (form.rola_id) {
      payload.rola_id = Number(form.rola_id);
    }
    if (form.limit_godzin_miesieczny) {
      payload.limit_godzin_miesieczny = Number(form.limit_godzin_miesieczny);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/pracownicy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.message ?? "Nie udało się dodać pracownika");
      }

      setForm(emptyForm);
      await refreshEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (employeeId: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tego pracownika?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/pracownicy/${employeeId}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error("Nie udało się usunąć pracownika");
      }

      await refreshEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Zarządzanie pracownikami
        </h1>
        <p className="text-sm text-slate-600">
          Dodawaj nowych pracowników, przypisuj role oraz ustawiaj podstawowe
          parametry zatrudnienia.
        </p>
      </header>

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Nowy pracownik</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Imię*</span>
            <input
              name="imie"
              value={form.imie}
              onChange={handleChange}
              required
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Nazwisko*</span>
            <input
              name="nazwisko"
              value={form.nazwisko}
              onChange={handleChange}
              required
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Rola</span>
            <select
              name="rola_id"
              value={form.rola_id}
              onChange={handleChange}
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Brak</option>
              {roleOptions.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nazwa_roli}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Etat</span>
            <input
              name="etat"
              value={form.etat}
              onChange={handleChange}
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="np. pełny"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Limit godzin / miesiąc</span>
            <input
              name="limit_godzin_miesieczny"
              value={form.limit_godzin_miesieczny}
              onChange={handleChange}
              type="number"
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Data zatrudnienia</span>
            <input
              name="data_zatrudnienia"
              value={form.data_zatrudnienia}
              onChange={handleChange}
              type="date"
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {submitting ? "Zapisywanie..." : "Dodaj pracownika"}
            </button>
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Lista pracowników</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-600">Ładowanie danych...</p>
        ) : employees.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            Brak pracowników. Dodaj pierwszego korzystając z formularza powyżej.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {employees.map((employee) => {
              const prefs = employee.preferencje as any;
              const isEditingPrefs = selectedEmployeeId === employee.id;
              
              return (
                <li
                  key={employee.id}
                  className="flex flex-col gap-4 rounded border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {employee.imie} {employee.nazwisko}
                      </p>
                      <p className="text-sm text-slate-600">
                        Rola: {roleOptions.find((role) => role.id === employee.rola_id)?.nazwa_roli ?? "brak"}
                      </p>
                      {employee.data_zatrudnienia && (
                        <p className="text-sm text-slate-600">
                          Od: {new Date(employee.data_zatrudnienia).toLocaleDateString("pl-PL")}
                        </p>
                      )}
                      {employee.limit_godzin_miesieczny && (
                        <p className="text-sm text-slate-600">
                          Limit godzin/mc: {employee.limit_godzin_miesieczny}
                        </p>
                      )}
                      {prefs && (
                        <div className="mt-2 text-xs text-slate-500">
                          {prefs.preferredOffDays && prefs.preferredOffDays.length > 0 && (
                            <p>Wolne dni: {Array.isArray(prefs.preferredOffDays) ? prefs.preferredOffDays.join(", ") : prefs.preferredOffDays}</p>
                          )}
                          {prefs.maxWeeklyHours && (
                            <p>Maks. godzin/tydz.: {prefs.maxWeeklyHours}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditingPrefs) {
                            setSelectedEmployeeId(null);
                            setPreferencesForm({ preferredOffDays: "", preferredShifts: "", avoidShifts: "", maxWeeklyHours: "" });
                          } else {
                            setSelectedEmployeeId(employee.id);
                            // Populate form with existing preferences
                            if (prefs) {
                              setPreferencesForm({
                                preferredOffDays: Array.isArray(prefs.preferredOffDays) ? prefs.preferredOffDays.join(", ") : (prefs.preferredOffDays || ""),
                                preferredShifts: Array.isArray(prefs.preferredShifts) ? prefs.preferredShifts.join(", ") : (prefs.preferredShifts || ""),
                                avoidShifts: Array.isArray(prefs.avoidShifts) ? prefs.avoidShifts.join(", ") : (prefs.avoidShifts || ""),
                                maxWeeklyHours: prefs.maxWeeklyHours ? String(prefs.maxWeeklyHours) : "",
                              });
                            }
                          }
                        }}
                        className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                      >
                        {isEditingPrefs ? "Anuluj" : "Preferencje"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(employee.id)}
                        className="text-sm font-medium text-red-600 transition hover:text-red-700"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>

                  {isEditingPrefs && (
                    <form
                      className="grid gap-3 md:grid-cols-2 mt-2 border-t pt-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitPreferences(employee.id);
                      }}
                    >
                      <label className="grid gap-1 text-sm">
                        <span className="font-medium">Preferowane dni wolne</span>
                        <input
                          name="preferredOffDays"
                          value={preferencesForm.preferredOffDays}
                          onChange={handlePreferencesChange}
                          placeholder="np. sobota, niedziela"
                          className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        <span className="font-medium">Preferowane zmiany (ID)</span>
                        <input
                          name="preferredShifts"
                          value={preferencesForm.preferredShifts}
                          onChange={handlePreferencesChange}
                          placeholder="np. 1, 2"
                          className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        <span className="font-medium">Unikać zmian (ID)</span>
                        <input
                          name="avoidShifts"
                          value={preferencesForm.avoidShifts}
                          onChange={handlePreferencesChange}
                          placeholder="np. 3, 4"
                          className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        <span className="font-medium">Maks. godzin tygodniowo</span>
                        <input
                          name="maxWeeklyHours"
                          value={preferencesForm.maxWeeklyHours}
                          onChange={handlePreferencesChange}
                          type="number"
                          min="0"
                          placeholder="np. 40"
                          className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                        />
                      </label>
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                        >
                          {submitting ? "Zapisywanie..." : "Zapisz preferencje"}
                        </button>
                      </div>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
