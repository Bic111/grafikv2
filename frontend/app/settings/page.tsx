"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Role = {
  id: number;
  nazwa_roli: string;
  minimalna_obsada: number | null;
  maksymalna_obsada: number | null;
};

type Shift = {
  id: number;
  nazwa_zmiany: string;
  godzina_rozpoczecia: string | null;
  godzina_zakonczenia: string | null;
  wymagana_obsada: unknown;
};

const appEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

const API_BASE_URL = appEnv?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

const emptyRole = {
  nazwa_roli: "",
  minimalna_obsada: "",
  maksymalna_obsada: "",
};

const emptyShift = {
  nazwa_zmiany: "",
  godzina_rozpoczecia: "",
  godzina_zakonczenia: "",
  wymagana_obsada: "",
};

export default function SettingsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
   const [holidayForm, setHolidayForm] = useState({ date: "", name: "", store_closed: false });
  const [staffingTemplates, setStaffingTemplates] = useState<any[]>([]);
   const [templateForm, setTemplateForm] = useState({ day_type: "WEEKDAY", shift_id: "", role_id: "", min_staff: "", target_staff: "", max_staff: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
   const [roleForm, setRoleForm] = useState(emptyRole);
   const [shiftForm, setShiftForm] = useState(emptyShift);

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => a.nazwa_roli.localeCompare(b.nazwa_roli)),
    [roles],
  );
  const sortedShifts = useMemo(
    () => [...shifts].sort((a, b) => a.nazwa_zmiany.localeCompare(b.nazwa_zmiany)),
    [shifts],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [rolesRes, shiftsRes, holidaysRes, templatesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/role`),
          fetch(`${API_BASE_URL}/api/zmiany`),
          fetch(`${API_BASE_URL}/api/swieta`),
          fetch(`${API_BASE_URL}/api/szablony-obsady`),
        ]);

        if (!rolesRes.ok) throw new Error("Nie udało się pobrać listy ról");
        if (!shiftsRes.ok) throw new Error("Nie udało się pobrać listy zmian");
        if (!holidaysRes.ok) throw new Error("Nie udało się pobrać listy świąt");
        if (!templatesRes.ok) throw new Error("Nie udało się pobrać szablonów obsady");

        setRoles((await rolesRes.json()) as Role[]);
        setShifts((await shiftsRes.json()) as Shift[]);
        setHolidays(await holidaysRes.json());
        setStaffingTemplates(await templatesRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const refreshData = async () => {
    const [rolesRes, shiftsRes, holidaysRes, templatesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/role`),
      fetch(`${API_BASE_URL}/api/zmiany`),
      fetch(`${API_BASE_URL}/api/swieta`),
      fetch(`${API_BASE_URL}/api/szablony-obsady`),
    ]);
    if (!rolesRes.ok || !shiftsRes.ok || !holidaysRes.ok || !templatesRes.ok) {
      throw new Error("Nie udało się odświeżyć konfiguracji");
    }
    setRoles((await rolesRes.json()) as Role[]);
    setShifts((await shiftsRes.json()) as Shift[]);
    setHolidays(await holidaysRes.json());
    setStaffingTemplates(await templatesRes.json());
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

  // Obsługa formularza szablonów obsady
  const handleTemplateChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setTemplateForm((current) => ({ ...current, [name]: value }));
  };

  const submitTemplate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        day_type: templateForm.day_type,
        shift_id: Number(templateForm.shift_id),
        role_id: Number(templateForm.role_id),
        min_staff: Number(templateForm.min_staff),
        target_staff: Number(templateForm.target_staff),
        max_staff: templateForm.max_staff ? Number(templateForm.max_staff) : undefined,
      };
      const response = await fetch(`${API_BASE_URL}/api/szablony-obsady`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Nie udało się dodać szablonu obsady");
      setTemplateForm({ day_type: "WEEKDAY", shift_id: "", role_id: "", min_staff: "", target_staff: "", max_staff: "" });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setSubmitting(false);
    }
  };
  // UI: sekcja świąt
  // UI: sekcja szablonów obsady
  // UI: sekcja profili wag generatora (do rozbudowy)
  // ...istniejący kod...

  const handleRoleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRoleForm((current) => ({ ...current, [name]: value }));
  };

  const handleShiftChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setShiftForm((current) => ({ ...current, [name]: value }));
  };

  const submitRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      nazwa_roli: roleForm.nazwa_roli.trim(),
    };

    if (roleForm.minimalna_obsada) {
      payload.minimalna_obsada = Number(roleForm.minimalna_obsada);
    }
    if (roleForm.maksymalna_obsada) {
      payload.maksymalna_obsada = Number(roleForm.maksymalna_obsada);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.message ?? "Nie udało się dodać roli");
      }

      setRoleForm(emptyRole);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setSubmitting(false);
    }
  };

  const submitShift = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      nazwa_zmiany: shiftForm.nazwa_zmiany.trim(),
      godzina_rozpoczecia: shiftForm.godzina_rozpoczecia || null,
      godzina_zakonczenia: shiftForm.godzina_zakonczenia || null,
    };

    if (shiftForm.wymagana_obsada) {
      try {
        payload.wymagana_obsada = JSON.parse(shiftForm.wymagana_obsada);
      } catch {
        setError("Pole 'wymagana_obsada' musi zawierać poprawny JSON");
        setSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/zmiany`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.message ?? "Nie udało się dodać zmiany");
      }

      setShiftForm(emptyShift);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRole = async (roleId: number) => {
    if (!confirm("Usunąć tę rolę?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/role/${roleId}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        throw new Error("Nie udało się usunąć roli");
      }
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    }
  };

  const deleteShift = async (shiftId: number) => {
    if (!confirm("Usunąć tę zmianę?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/zmiany/${shiftId}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        throw new Error("Nie udało się usunąć zmiany");
      }
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    }
  };

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Konfiguracja systemu
        </h1>
        <p className="text-sm text-slate-600">
          Zarządzaj strukturą zespołu, definicjami zmian, świętami i wymaganiami obsadowymi.
        </p>
      </header>

      {/* Sekcja Świąt */}
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

      {/* Sekcja Szablonów Obsady */}
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Wymagania obsadowe</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={submitTemplate}>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Typ dnia*</span>
            <select
              name="day_type"
              value={templateForm.day_type}
              onChange={handleTemplateChange}
              required
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="WEEKDAY">Dzień roboczy</option>
              <option value="WEEKEND">Weekend</option>
              <option value="HOLIDAY">Święto</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Zmiana*</span>
            <select
              name="shift_id"
              value={templateForm.shift_id}
              onChange={handleTemplateChange}
              required
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Wybierz zmianę</option>
              {sortedShifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.nazwa_zmiany}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Rola*</span>
            <select
              name="role_id"
              value={templateForm.role_id}
              onChange={handleTemplateChange}
              required
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Wybierz rolę</option>
              {sortedRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nazwa_roli}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Min. obsada*</span>
            <input
              name="min_staff"
              type="number"
              value={templateForm.min_staff}
              onChange={handleTemplateChange}
              required
              min="0"
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Docelowa obsada*</span>
            <input
              name="target_staff"
              type="number"
              value={templateForm.target_staff}
              onChange={handleTemplateChange}
              required
              min="0"
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Maks. obsada</span>
            <input
              name="max_staff"
              type="number"
              value={templateForm.max_staff}
              onChange={handleTemplateChange}
              min="0"
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {submitting ? "Zapisywanie..." : "Dodaj szablon"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Zdefiniowane szablony
          </h3>
          {loading ? (
            <p className="mt-3 text-sm text-slate-600">Ładowanie...</p>
          ) : staffingTemplates.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Brak zdefiniowanych szablonów obsady.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {staffingTemplates.map((template) => (
                <li
                  key={template.id}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {template.day_type === "WEEKDAY" ? "Dzień roboczy" : template.day_type === "WEEKEND" ? "Weekend" : "Święto"} •{" "}
                      {sortedShifts.find((s) => s.id === template.shift_id)?.nazwa_zmiany ?? `Zmiana #${template.shift_id}`} •{" "}
                      {sortedRoles.find((r) => r.id === template.role_id)?.nazwa_roli ?? `Rola #${template.role_id}`}
                    </p>
                    <p className="text-xs text-slate-600">
                      Min: {template.min_staff} • Cel: {template.target_staff} • Maks: {template.max_staff ?? "-"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Usunąć ten szablon?")) {
                        try {
                          const response = await fetch(`${API_BASE_URL}/api/szablony-obsady/${template.id}`, {
                            method: "DELETE",
                          });
                          if (!response.ok && response.status !== 204) {
                            throw new Error("Nie udało się usunąć szablonu");
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

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">Role</h2>
          <form className="mt-4 space-y-3" onSubmit={submitRole}>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Nazwa roli*</span>
              <input
                name="nazwa_roli"
                value={roleForm.nazwa_roli}
                onChange={handleRoleChange}
                required
                className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Minimalna obsada</span>
                <input
                  name="minimalna_obsada"
                  type="number"
                  value={roleForm.minimalna_obsada}
                  onChange={handleRoleChange}
                  className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Maksymalna obsada</span>
                <input
                  name="maksymalna_obsada"
                  type="number"
                  value={roleForm.maksymalna_obsada}
                  onChange={handleRoleChange}
                  className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {submitting ? "Zapisywanie..." : "Dodaj rolę"}
            </button>
          </form>

          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Zdefiniowane role
            </h3>
            {loading ? (
              <p className="mt-3 text-sm text-slate-600">Ładowanie...</p>
            ) : sortedRoles.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">Brak zdefiniowanych ról.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {sortedRoles.map((role) => (
                  <li
                    key={role.id}
                    className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{role.nazwa_roli}</p>
                      <p className="text-xs text-slate-600">
                        Min: {role.minimalna_obsada ?? "-"} • Max: {role.maksymalna_obsada ?? "-"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteRole(role.id)}
                      className="text-xs font-semibold text-red-600 transition hover:text-red-700"
                    >
                      Usuń
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">Zmiany</h2>
          <form className="mt-4 space-y-3" onSubmit={submitShift}>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Nazwa zmiany*</span>
              <input
                name="nazwa_zmiany"
                value={shiftForm.nazwa_zmiany}
                onChange={handleShiftChange}
                required
                className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Start</span>
                <input
                  name="godzina_rozpoczecia"
                  type="time"
                  value={shiftForm.godzina_rozpoczecia}
                  onChange={handleShiftChange}
                  className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Koniec</span>
                <input
                  name="godzina_zakonczenia"
                  type="time"
                  value={shiftForm.godzina_zakonczenia}
                  onChange={handleShiftChange}
                  className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </label>
            </div>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Wymagana obsada (JSON)</span>
              <textarea
                name="wymagana_obsada"
                value={shiftForm.wymagana_obsada}
                onChange={handleShiftChange}
                rows={3}
                className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder='Np. {"Kasjer": 2}'
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {submitting ? "Zapisywanie..." : "Dodaj zmianę"}
            </button>
          </form>

          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Zdefiniowane zmiany
            </h3>
            {loading ? (
              <p className="mt-3 text-sm text-slate-600">Ładowanie...</p>
            ) : sortedShifts.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">Brak zdefiniowanych zmian.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {sortedShifts.map((shift) => (
                  <li
                    key={shift.id}
                    className="flex items-start justify-between rounded border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{shift.nazwa_zmiany}</p>
                      <p className="text-xs text-slate-600">
                        {shift.godzina_rozpoczecia ?? "--:--"} – {shift.godzina_zakonczenia ?? "--:--"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteShift(shift.id)}
                      className="text-xs font-semibold text-red-600 transition hover:text-red-700"
                    >
                      Usuń
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
