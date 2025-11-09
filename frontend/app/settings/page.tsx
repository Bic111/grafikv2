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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

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
  const [roleForm, setRoleForm] = useState(emptyRole);
  const [shiftForm, setShiftForm] = useState(emptyShift);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
        const [rolesRes, shiftsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/role`),
          fetch(`${API_BASE_URL}/api/zmiany`),
        ]);

        if (!rolesRes.ok) {
          throw new Error("Nie udało się pobrać listy ról");
        }
        if (!shiftsRes.ok) {
          throw new Error("Nie udało się pobrać listy zmian");
        }

        setRoles((await rolesRes.json()) as Role[]);
        setShifts((await shiftsRes.json()) as Shift[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const refreshData = async () => {
    const [rolesRes, shiftsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/role`),
      fetch(`${API_BASE_URL}/api/zmiany`),
    ]);
    if (!rolesRes.ok || !shiftsRes.ok) {
      throw new Error("Nie udało się odświeżyć konfiguracji");
    }
    setRoles((await rolesRes.json()) as Role[]);
    setShifts((await shiftsRes.json()) as Shift[]);
  };

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
          Konfiguracja ról i zmian
        </h1>
        <p className="text-sm text-slate-600">
          Zarządzaj strukturą zespołu oraz definicjami zmian wymaganymi do
          generowania grafiku.
        </p>
      </header>

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
