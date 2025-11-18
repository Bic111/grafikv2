/**
 * E2E Test: Edit employee etat (employment percentage)
 * Tests the scenario where a user edits an employee's etat from 25% to 100%
 */

import { test, expect } from '@playwright/test';

test.describe('Employee etat editing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to employees page
    await page.goto('http://localhost:3000/employees');
    await page.waitForLoadState('networkidle');
  });

  test('should display employees with correct etat values', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Check that at least one employee is displayed
    const employeeRows = page.locator('tbody tr');
    await expect(employeeRows.first()).toBeVisible();

    // Verify that etat column exists and shows percentage values
    const etatCells = page.locator('tbody tr td:nth-child(4)');
    const firstEtatText = await etatCells.first().textContent();
    expect(firstEtatText).toMatch(/25%|50%|75%|100%/);
  });

  test('should successfully update employee etat from 25% to 100%', async ({ page }) => {
    // Wait for employees table to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Find an employee with 25% etat or use the first one
    const employeeRows = page.locator('tbody tr');
    const firstRow = employeeRows.first();

    // Get employee name before editing (for verification)
    const employeeName = await firstRow.locator('td:first-child').textContent();
    console.log(`Editing employee: ${employeeName}`);

    // Click edit button (pencil icon)
    await firstRow.locator('button[title="Edytuj pracownika"]').click();

    // Wait for form to appear
    await page.waitForSelector('form', { timeout: 5000 });

    // Get current etat value
    const etatSelect = page.locator('select#etat');
    const currentEtat = await etatSelect.inputValue();
    console.log(`Current etat: ${currentEtat}`);

    // Change etat to 100% (1.0)
    await etatSelect.selectOption('1');

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Wait for form to close and table to refresh
    await page.waitForSelector('form', { state: 'hidden', timeout: 5000 });

    // Wait for network requests to complete
    await page.waitForLoadState('networkidle');

    // Verify that the etat was updated in the table
    // Find the same employee row again
    const updatedRow = page.locator(`tbody tr:has-text("${employeeName?.trim()}")`).first();
    const updatedEtat = await updatedRow.locator('td:nth-child(4)').textContent();

    expect(updatedEtat).toContain('100%');
    console.log(`Updated etat: ${updatedEtat}`);
  });

  test('should persist etat changes after page reload', async ({ page }) => {
    // Edit an employee's etat
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const firstRow = page.locator('tbody tr').first();
    const employeeName = await firstRow.locator('td:first-child').textContent();

    // Edit employee
    await firstRow.locator('button[title="Edytuj pracownika"]').click();
    await page.waitForSelector('select#etat');

    // Change to 50% (0.5)
    await page.locator('select#etat').selectOption('0.5');
    await page.locator('button[type="submit"]').click();

    // Wait for save
    await page.waitForSelector('form', { state: 'hidden', timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify etat is still 50%
    const updatedRow = page.locator(`tbody tr:has-text("${employeeName?.trim()}")`).first();
    const etatAfterReload = await updatedRow.locator('td:nth-child(4)').textContent();

    expect(etatAfterReload).toContain('50%');
  });

  test('should allow multiple etat updates', async ({ page }) => {
    // Test updating from 25% -> 50% -> 75% -> 100%
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const firstRow = page.locator('tbody tr').first();
    const employeeName = await firstRow.locator('td:first-child').textContent();

    const etatValues = ['0.5', '0.75', '1'];
    const expectedDisplays = ['50%', '75%', '100%'];

    for (let i = 0; i < etatValues.length; i++) {
      // Open edit form
      await firstRow.locator('button[title="Edytuj pracownika"]').click();
      await page.waitForSelector('select#etat');

      // Update etat
      await page.locator('select#etat').selectOption(etatValues[i]);
      await page.locator('button[type="submit"]').click();

      // Wait for save
      await page.waitForSelector('form', { state: 'hidden', timeout: 5000 });
      await page.waitForLoadState('networkidle');

      // Verify change
      const updatedRow = page.locator(`tbody tr:has-text("${employeeName?.trim()}")`).first();
      const currentEtat = await updatedRow.locator('td:nth-child(4)').textContent();
      expect(currentEtat).toContain(expectedDisplays[i]);
    }
  });
});
