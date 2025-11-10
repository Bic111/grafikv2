/**
 * Employees Page
 * Main page with tabbed interface for employee management
 * Implements User Story 7: Tab navigation and User Story 1: Employees tab
 */

'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as Tabs from '@radix-ui/react-tabs';
import { EmployeesTab } from '@/components/employees/EmployeesTab';
import { UrlopyTab } from '@/components/employees/UrlopyTab';
import { ZwolnieniaTab } from '@/components/employees/ZwolnieniaTab';
import { ParametryZmianTab } from '@/components/employees/ParametryZmianTab';
import { SwietaTab } from '@/components/employees/SwietaTab';
import { RegulyTab } from '@/components/employees/RegulyTab';

/**
 * Tab configuration
 */
const TABS = [
  { id: 'wszyscy', label: 'Wszyscy', component: EmployeesTab },
  { id: 'urlopy', label: 'Urlopy', component: UrlopyTab },
  { id: 'zwolnienia', label: 'Zwolnienia', component: ZwolnieniaTab },
  { id: 'parametry-zmian', label: 'Parametry zmian', component: ParametryZmianTab },
  { id: 'swieta', label: 'Święta', component: SwietaTab },
  { id: 'reguly', label: 'Reguły', component: RegulyTab },
] as const;

/**
 * Employees Page
 */
export default function EmployeesPage(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get active tab from query params, default to 'wszyscy'
  const activeTab = (searchParams.get('tab') as string) || 'wszyscy';

  // Validate active tab exists
  const validatedTab = TABS.find((t) => t.id === activeTab)?.id || 'wszyscy';

  const handleTabChange = (tabId: string) => {
    // Update URL with new tab
    router.push(`/employees?tab=${tabId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pracownicy</h1>
          <p className="mt-2 text-gray-600">
            Zarządzaj informacjami o pracownikach, urlopami, zwolnieniami i parametrami pracy
          </p>
        </div>

        {/* Tabs */}
        <Tabs.Root
          value={validatedTab}
          onValueChange={handleTabChange}
          className="rounded-lg bg-white shadow"
        >
          <Tabs.List className="flex border-b border-gray-200" aria-label="Workplace tabs">
            {TABS.map((tab) => (
              <Tabs.Trigger
                key={tab.id}
                value={tab.id}
                className="flex-1 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Tab Content */}
          {TABS.map((tab) => (
            <Tabs.Content key={tab.id} value={tab.id} className="p-6">
              {tab.component ? (
                <tab.component />
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{tab.label}</h3>
                  <p className="mt-2 text-gray-600">
                    Ta funkcjonalność będzie wkrótce dostępna
                  </p>
                </div>
              )}
            </Tabs.Content>
          ))}
        </Tabs.Root>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Pracownicy &bull; Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>
        </div>
      </div>
    </div>
  );
}
