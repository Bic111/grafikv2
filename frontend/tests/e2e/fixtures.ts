/* eslint react-hooks/rules-of-hooks: 0 */
import { test as base, expect } from '@playwright/test';

type AppFixtures = {
  appUrl: string;
};

export const test = base.extend<AppFixtures>({
  // Fixture dostarcza bazowy URL aplikacji – brak React hooków, zwykła asynchroniczna funkcja.
  appUrl: async ({ baseURL }, use) => {
    const fallback = process.env.PLAYWRIGHT_APP_URL ?? 'http://localhost:3000';
    await use(baseURL ?? fallback);
  },
});

export { expect };
