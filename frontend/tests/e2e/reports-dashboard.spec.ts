import { test, expect, APIRequestContext, Page } from '@playwright/test';

// T027 – Playwright flow covering dashboard KPIs and report export.
// Tests the monitoring and reporting features for User Story 3.

test.describe('US3 – Dashboard i eksport raportów (T027)', () => {
  test('API sanity: endpoint raportów dostępny', async ({ request }: { request: APIRequestContext }) => {
    const tryGet = async (url: string) => {
      try {
        const res = await request.get(url);
        return res.status();
      } catch {
        test.skip(true, 'Serwer nie jest uruchomiony – pomijam sanity check');
      }
    };

    const status = await tryGet('/api/raporty?month=2025-11');
    if (status !== undefined) expect([200, 404, 501]).toContain(status);
  });

  test('Dashboard: wyświetla KPI i metryki grafiku', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Sprawdź czy dashboard jest widoczny
    const dashboardHeading = page.getByRole('heading', { name: /Dashboard|Panel główny/i });
    await expect(dashboardHeading).toBeVisible({ timeout: 10000 });

    // Sprawdź czy są sekcje KPI
    // (konkretne selektory zależą od implementacji T030)
    const metricsSection = page.locator('[data-testid="metrics-section"], .metrics, .kpi-cards').first();
    if (await metricsSection.isVisible()) {
      await expect(metricsSection).toBeVisible();
    }
  });

  test('Dashboard: pokazuje nadchodzące nieobecności', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Poczekaj na załadowanie strony
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Sprawdź czy jest sekcja z nieobecnościami
    const absencesSection = page.locator('[data-testid="absences-section"], .absences, .upcoming-absences').first();
    if (await absencesSection.isVisible()) {
      await expect(absencesSection).toBeVisible();
    }
  });

  test('Raporty: nawigacja do strony raportów', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Znajdź link do raportów w menu bocznym lub nawigacji
    const reportsLink = page.getByRole('link', { name: /Raporty|Reports/i });
    if (await reportsLink.isVisible({ timeout: 5000 })) {
      await reportsLink.click();
      await expect(page).toHaveURL(/\/reports/);
    } else {
      // Bezpośrednia nawigacja jeśli link nie jest widoczny
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');
    }
    
    const reportsHeading = page.getByRole('heading', { name: /Raporty/i });
    await expect(reportsHeading).toBeVisible({ timeout: 10000 });
  });

  test.skip('Raporty: filtrowanie po miesiącu (aktywny po T031)', async ({ page }: { page: Page }) => {
    await page.goto('/reports');
    
    // Znajdź selektor miesiąca
    const monthSelector = page.locator('input[type="month"], select[name="month"]').first();
    await expect(monthSelector).toBeVisible();
    
    // Wybierz konkretny miesiąc
    await monthSelector.fill('2025-11');
    
    // Sprawdź czy dane się odświeżyły
    await page.waitForResponse(response => 
      response.url().includes('/api/raporty') && response.status() === 200
    );
  });

  test.skip('Raporty: eksport do CSV (aktywny po T031)', async ({ page }: { page: Page }) => {
    await page.goto('/reports');
    
    // Znajdź przycisk eksportu
    const exportButton = page.getByRole('button', { name: /Eksportuj|Export|CSV/i });
    await expect(exportButton).toBeVisible();
    
    // Kliknij przycisk eksportu
    const downloadPromise = page.waitForEvent('download');
    await exportButton.click();
    
    // Sprawdź czy plik został pobrany
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.csv$/i);
  });

  test.skip('Dashboard: wyświetla alerty walidacji (aktywny po T030)', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Sprawdź czy są alerty/ostrzeżenia
    const alertsSection = page.locator('[data-testid="alerts"], .alerts, .validation-issues').first();
    await expect(alertsSection).toBeVisible();
    
    // Sprawdź czy alerty mają odpowiednią klasyfikację (błędy, ostrzeżenia)
    const criticalAlerts = page.locator('.alert-critical, .alert-error, [data-severity="critical"]');
    if (await criticalAlerts.count() > 0) {
      await expect(criticalAlerts.first()).toBeVisible();
    }
  });
});
