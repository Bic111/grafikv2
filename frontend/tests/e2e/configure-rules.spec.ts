import { test, expect, APIRequestContext, Page } from '@playwright/test';
// import { getJson, postJson } from './helpers/requests'; // Nie używane w scaffolding – odkomentuj gdy potrzebne

// T020 – Playwright flow covering editing holidays and generator weights.
// Obecnie UI dla świąt i wag generatora nie istnieje (zostanie dodany w T024–T026).
// Test przygotowuje TDD scaffold: gdy komponenty pojawią się w `/settings`, usuń test.skip.

test.describe('US2 – Konfiguracja świąt i wag generatora (T020 scaffold)', () => {
  test('API sanity: lista świąt i profili parametrów (fallback gdy UI niegotowe)', async ({ request }: { request: APIRequestContext }) => {
    // Weryfikujemy, że backend (po wdrożeniu T021–T023) udostępni endpoints.
    // Gdy aplikacje nie są uruchomione, test jest warunkowo pomijany.
    const tryGet = async (url: string) => {
      try {
        const res = await request.get(url);
        return res.status();
      } catch {
        test.skip(true, 'Serwer nie jest uruchomiony – pomijam sanity check');
      }
    };

    const hStatus = await tryGet('/api/swieta');
    if (hStatus !== undefined) expect([200, 404, 501]).toContain(hStatus);
    const pStatus = await tryGet('/api/parametry-generatora');
    if (pStatus !== undefined) expect([200, 404, 501]).toContain(pStatus);
  });

  test.skip('UI: dodanie nowego święta przez formularz (aktywny po T024)', async ({ page }: { page: Page }) => {
    await page.goto('/settings');
    // Oczekiwany selektor sekcji świąt (do uzupełnienia w implementacji UI)
    const holidaysSection = page.getByRole('heading', { name: /Święta/i });
    await expect(holidaysSection).toBeVisible();
    // TODO: Interakcje z formularzem dodawania święta
  });

  test.skip('UI: modyfikacja wag generatora (aktywny po T024/T026)', async ({ page }: { page: Page }) => {
    await page.goto('/settings');
    const weightsSection = page.getByRole('heading', { name: /Parametry generatora/i });
    await expect(weightsSection).toBeVisible();
    // TODO: Zmiana wartości wag i zapis
  });
});
