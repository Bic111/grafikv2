import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LimitForm } from '@/components/employees/forms/LimitForm';
import type { HourLimit } from '@/types';
// Referencja do typów testów; jeśli projekt nie deklaruje w tsconfig, można dodać tutaj
/// <reference types="jest" />

/**
 * Regresssion test: legacy key `max_miesiecznie` should be normalized to canonical `max_miesięcznie`
 */

describe('LimitForm normalization', () => {
  it('fills monthly field when initialData uses legacy max_miesiecznie', async () => {
    const initialDataLegacy = {
      id: '1',
      etat: 1.0 as const,
      max_dziennie: 8,
      max_tygodniowo: 40,
      // legacy key coming from older API
      max_miesiecznie: 160,
      max_kwartalnie: 480,
    };

    render(
      <LimitForm initialData={initialDataLegacy as unknown as HourLimit} onSubmit={() => {}} />
    );

    const monthly = screen.getByLabelText('Maksymalnie na miesiąc (godzin)') as HTMLInputElement;
    expect(monthly.value).toBe('160');
  });
});
