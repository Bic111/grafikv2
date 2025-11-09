"use client";

import { FormEvent, useState } from "react";

type GenerationResponse = {
  id: number;
  miesiac_rok: string;
  status: string;
  issues: { level: string; message: string }[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

function formatMonthInput(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export default function GeneratorPage() {
  const [month, setMonth] = useState(formatMonthInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResponse | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const [year, monthValue] = month.split("-");

    try {
      const response = await fetch(`${API_BASE_URL}/api/grafiki/generuj`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: Number(year), month: Number(monthValue) }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.message ?? "Nie udało się wygenerować grafiku");
      }

      const data = (await response.json()) as GenerationResponse;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Generowanie grafiku
        </h1>
        <p className="text-sm text-slate-600">
          Wybierz miesiąc i uruchom generator, aby utworzyć roboczy grafik na wskazany
          okres.
        </p>
      </header>

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <form className="flex flex-wrap items-end gap-4" onSubmit={submit}>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Miesiąc</span>
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? "Generowanie..." : "Wygeneruj grafik"}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </section>

      {result && (
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">Podsumowanie</h2>
          <dl className="mt-4 grid gap-2 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <dt>Miesiąc</dt>
              <dd>{result.miesiac_rok}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Status</dt>
              <dd>{result.status}</dd>
            </div>
          </dl>
          {result.issues.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-slate-900">
                Wykryte problemy ({result.issues.length}):
              </p>
              <ul className="space-y-1 text-sm text-slate-600">
                {result.issues.map((issue, index) => (
                  <li key={`${issue.level}-${index}`}>
                    <span className="font-semibold uppercase text-red-600">
                      {issue.level}
                    </span>{" "}
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-green-600">
              Grafiki wygenerowano bez krytycznych problemów.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
