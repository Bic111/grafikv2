"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Employee = {
  id: number;
  imie: string;
  nazwisko: string;
};

type Absence = {
  id: number;
  pracownik_id: number;
  typ_nieobecnosci: string;
  data_od: string;
  data_do: string;
  pracownik?: {
    imie: string | null;
    nazwisko: string | null;
  } | null;
};

const appEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

const API_BASE_URL = appEnv?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

const emptyForm = {
  pracownik_id: "",
  typ_nieobecnosci: "",
  data_od: "",
  data_do: "",
};

export default function AbsencesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [employeesRes, absencesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/pracownicy`),
          fetch(`${API_BASE_URL}/api/nieobecnosci`),
        ]);

        if (!employeesRes.ok) {
          throw new Error("Nie udało się pobrać listy pracowników");
        }
        if (!absencesRes.ok) {
          throw new Error("Nie udało się pobrać nieobecności");
        }

        const employeeData = (await employeesRes.json()) as Employee[];
        const absenceData = (await absencesRes.json()) as Absence[];
        setEmployees(employeeData);
        setAbsences(absenceData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const employeeOptions = useMemo(
    () =>
      [...employees].sort((a, b) =>
        `${a.nazwisko} ${a.imie}`.localeCompare(`${b.nazwisko} ${b.imie}`),
      ),
    [employees],
  );

  const refreshAbsences = async () => {
    const response = await fetch(`${API_BASE_URL}/api/nieobecnosci`);
    if (!response.ok) {
      throw new Error("Nie udało się odświeżyć listy nieobecności");
    }
    const data = (await response.json()) as Absence[];
    setAbsences(data);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/nieobecnosci`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pracownik_id: Number(form.pracownik_id),
          typ_nieobecnosci: form.typ_nieobecnosci.trim(),
          data_od: form.data_od,
          data_do: form.data_do,
        }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.message ?? "Nie udało się dodać nieobecności");
      }

      setForm(emptyForm);
      await refreshAbsences();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (absenceId: number) => {
    if (!confirm("Usunąć nieobecność?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/nieobecnosci/${absenceId}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        throw new Error("Nie udało się usunąć nieobecności");
      }
      await refreshAbsences();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Nieobecności</h1>
        <p className="text-sm text-slate-600">
          Dodawaj urlopy i inne nieobecności, które powinny zostać uwzględnione przy
          generowaniu grafiku.
        </p>
      </header>

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Nowa nieobecność</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Pracownik*</span>
            <select
              name="pracownik_id"
              value={form.pracownik_id}
              onChange={handleChange}
              required
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Wybierz pracownika</option>
              {employeeOptions.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.nazwisko} {employee.imie}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Typ nieobecności*</span>
            <input
              name="typ_nieobecnosci"
              value={form.typ_nieobecnosci}
              onChange={handleChange}
              required
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="np. Urlop"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Data od*</span>
            <input
              type="date"
              name="data_od"
              value={form.data_od}
              onChange={handleChange}
              required
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Data do*</span>
            <input
              type="date"
              name="data_do"
              value={form.data_do}
              onChange={handleChange}
              required
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {submitting ? "Zapisywanie..." : "Dodaj nieobecność"}
            </button>
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Lista nieobecności</h2>
        {loading ? (
          <p className="mt-3 text-sm text-slate-600">Ładowanie danych...</p>
        ) : absences.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">Brak zarejestrowanych nieobecności.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Pracownik</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Typ</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Od</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Do</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {absences.map((absence) => {
                  const employee = employees.find((emp) => emp.id === absence.pracownik_id);
                  return (
                    <tr key={absence.id}>
                      <td className="px-3 py-2 text-slate-800">
                        {employee ? `${employee.nazwisko} ${employee.imie}` : absence.pracownik_id}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{absence.typ_nieobecnosci}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {new Date(absence.data_od).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {new Date(absence.data_do).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(absence.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Usuń
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
