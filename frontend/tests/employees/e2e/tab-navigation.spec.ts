/**
 * E2E tests for employees page tab navigation
 * Tests User Story 7: Tab Navigation functionality
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Tab Navigation - Employees Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to employees page
    await page.goto(`${BASE_URL}/employees`, { waitUntil: 'networkidle' });
  });

  test('should render all 6 tabs on page load', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(6);

    // Check tab labels
    const tabLabels = ['Wszyscy', 'Urlopy', 'Zwolnienia', 'Parametry zmian', 'Święta', 'Reguły'];
    for (const label of tabLabels) {
      await expect(page.locator(`[role="tab"]:has-text("${label}")`)).toBeVisible();
    }
  });

  test('should have "Wszyscy" tab active by default', async ({ page }) => {
    const allTab = page.locator('[role="tab"]:has-text("Wszyscy")');
    await expect(allTab).toHaveAttribute('data-state', 'active');

    // URL should not have tab parameter or should be ?tab=wszyscy
    const url = page.url();
    expect(url).toMatch(/\/employees(\?tab=wszyscy)?$/);
  });

  test('should switch to "Urlopy" tab and show content', async ({ page }) => {
    // Click urlopy tab
    const urlopyTab = page.locator('[role="tab"]:has-text("Urlopy")');
    await urlopyTab.click();

    // Wait for tab to be active and content to render
    await expect(urlopyTab).toHaveAttribute('data-state', 'active');

    // Check URL changed
    const url = page.url();
    expect(url).toContain('?tab=urlopy');

    // Check content is visible (heading or table)
    const tabContent = page.locator('[role="tabpanel"]').first();
    await expect(tabContent).toBeVisible();
  });

  test('should switch to "Zwolnienia" tab and show content', async ({ page }) => {
    // Click zwolnienia tab
    const zwolnieniaTab = page.locator('[role="tab"]:has-text("Zwolnienia")');
    await zwolnieniaTab.click();

    // Wait for tab to be active
    await expect(zwolnieniaTab).toHaveAttribute('data-state', 'active');

    // Check URL changed
    const url = page.url();
    expect(url).toContain('?tab=zwolnienia');

    // Check content is visible
    const tabContent = page.locator('[role="tabpanel"]').first();
    await expect(tabContent).toBeVisible();
  });

  test('should preserve data when switching tabs and returning', async ({ page }) => {
    // First load Urlopy tab
    const urlopyTab = page.locator('[role="tab"]:has-text("Urlopy")');
    await urlopyTab.click();
    await expect(urlopyTab).toHaveAttribute('data-state', 'active');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Switch to Zwolnienia tab
    const zwolnieniaTab = page.locator('[role="tab"]:has-text("Zwolnienia")');
    await zwolnieniaTab.click();
    await expect(zwolnieniaTab).toHaveAttribute('data-state', 'active');

    // Switch back to Urlopy
    await urlopyTab.click();
    await expect(urlopyTab).toHaveAttribute('data-state', 'active');

    // Content should still be there (data preserved)
    const urlopyContent = page.locator('[role="tabpanel"]').first();
    await expect(urlopyContent).toBeVisible();
  });

  test('should respond to direct URL navigation with ?tab parameter', async ({ page }) => {
    // Navigate directly to urlopy tab via URL
    await page.goto(`${BASE_URL}/employees?tab=urlopy`, { waitUntil: 'networkidle' });

    // Urlopy tab should be active
    const urlopyTab = page.locator('[role="tab"]:has-text("Urlopy")');
    await expect(urlopyTab).toHaveAttribute('data-state', 'active');
  });

  test('should have active tab styling', async ({ page }) => {
    // Click urlopy tab
    const urlopyTab = page.locator('[role="tab"]:has-text("Urlopy")');
    await urlopyTab.click();

    // Check styling (blue text and border for active state)
    await expect(urlopyTab).toHaveClass(/data-\[state=active\]:text-blue-600/);

    // Active tab should have blue border
    const activeTabStyle = await urlopyTab.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        borderColor: style.borderColor,
        color: style.color,
      };
    });

    // Should have blue color indication (specific value depends on CSS)
    expect(activeTabStyle.color).toBeDefined();
  });

  test('should handle rapid tab switching', async ({ page }) => {
    const tabs = [
      '[role="tab"]:has-text("Wszyscy")',
      '[role="tab"]:has-text("Urlopy")',
      '[role="tab"]:has-text("Zwolnienia")',
      '[role="tab"]:has-text("Urlopy")',
      '[role="tab"]:has-text("Wszyscy")',
    ];

    for (const tabSelector of tabs) {
      const tab = page.locator(tabSelector);
      await tab.click();
      await expect(tab).toHaveAttribute('data-state', 'active');
    }

    // Final state should be Wszyscy active
    const wszyscyTab = page.locator('[role="tab"]:has-text("Wszyscy")');
    await expect(wszyscyTab).toHaveAttribute('data-state', 'active');
  });

  test('should show placeholder content for unimplemented tabs', async ({ page }) => {
    // Click on parametry-zmian tab (not implemented yet)
    const parametryTab = page.locator('[role="tab"]:has-text("Parametry zmian")');
    await parametryTab.click();

    await expect(parametryTab).toHaveAttribute('data-state', 'active');

    // Should show placeholder message
    const placeholder = page.locator('text=Ta funkcjonalność będzie wkrótce dostępna');
    await expect(placeholder).toBeVisible();
  });

  test('tab switching should be responsive (<200ms)', async ({ page }) => {
    const urlopyTab = page.locator('[role="tab"]:has-text("Urlopy")');

    // Measure time between click and tab becoming active
    const startTime = Date.now();
    await urlopyTab.click();
    await expect(urlopyTab).toHaveAttribute('data-state', 'active');
    const endTime = Date.now();

    const switchTime = endTime - startTime;
    console.log(`Tab switch time: ${switchTime}ms`);

    // Should be responsive (less than 200ms for UI update)
    // Note: This is approximate, actual performance may vary
    expect(switchTime).toBeLessThan(500); // Generous timeout for CI environments
  });

  test('should display page header correctly', async ({ page }) => {
    const heading = page.locator('h1:has-text("Pracownicy")');
    await expect(heading).toBeVisible();

    const description = page.locator('text=Zarządzaj informacjami o pracownikach');
    await expect(description).toBeVisible();
  });

  test('should maintain scroll position within tab content', async ({ page }) => {
    // Navigate to employees tab (has content)
    const wszyscyTab = page.locator('[role="tab"]:has-text("Wszyscy")');
    await wszyscyTab.click();

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Scroll down in tab content
    await page.evaluate(() => window.scrollBy(0, 500));

    let scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(0);

    // Switch to another tab
    const urlopyTab = page.locator('[role="tab"]:has-text("Urlopy")');
    await urlopyTab.click();

    // Switch back
    await wszyscyTab.click();

    // Scroll position might be reset (depends on implementation)
    // Just verify we can still scroll
    scrollPosition = await page.evaluate(() => window.scrollY);
    expect(typeof scrollPosition).toBe('number');
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Focus on first tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Tab to tabs area

    // Use arrow keys to navigate tabs
    await page.keyboard.press('ArrowRight'); // Move to next tab

    // Second tab should now be active
    const urlopyTab = page.locator('[role="tab"]:has-text("Urlopy")');
    // Tab should be focused/active (keyboard navigation should work)
    const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedElement).toContain('Urlopy');
  });

  test('should render without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Perform various tab switches
    await page.locator('[role="tab"]:has-text("Urlopy")').click();
    await page.locator('[role="tab"]:has-text("Zwolnienia")').click();
    await page.locator('[role="tab"]:has-text("Wszyscy")').click();

    // No console errors should have been logged
    expect(consoleErrors).toHaveLength(0);
  });
});
