"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { ParametryZmianTab } from "@/components/employees/ParametryZmianTab";
import { RegulyTab } from "@/components/employees/RegulyTab";
import { SwietaTab } from "@/components/employees/SwietaTab";

const appEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

const API_BASE_URL = appEnv?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

/**
 * Tab configuration for Settings page
 * Sekcje: Święta i dni specjalne, Parametry zmian, Reguły
 */
const SETTINGS_TABS = [
  { id: "swieta", label: "Święta i dni specjalne", component: SwietaTab },
  { id: "parametry-zmian", label: "Parametry zmian", component: ParametryZmianTab },
  { id: "reguly", label: "Reguły", component: RegulyTab },
] as const;

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get active tab from query params, default to 'swieta'
  const activeTab = (searchParams.get("tab") as string) || "swieta";

  // Validate active tab exists
  const validatedTab = SETTINGS_TABS.find((t) => t.id === activeTab)?.id || "swieta";

  const handleTabChange = (tabId: string) => {
    // Update URL with new tab
    router.push(`/settings?tab=${tabId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ustawienia</h1>
          <p className="mt-2 text-gray-600">
            Zarządzaj parametrami zmian, regułami, świętami i wymaganiami obsadowymi
          </p>
        </div>

        {/* Tabs */}
        <Tabs.Root
          value={validatedTab}
          onValueChange={handleTabChange}
          className="rounded-lg bg-white shadow"
        >
          <Tabs.List className="flex border-b border-gray-200" aria-label="Settings tabs">
            {SETTINGS_TABS.map((tab) => (
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
          <Tabs.Content value="swieta" className="p-6">
            <SwietaTab />
          </Tabs.Content>

          {/* Parametry zmian Tab */}
          <Tabs.Content value="parametry-zmian" className="p-6">
            <ParametryZmianTab />
          </Tabs.Content>

          {/* Reguły Tab */}
          <Tabs.Content value="reguly" className="p-6">
            <RegulyTab />
          </Tabs.Content>
        </Tabs.Root>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Ustawienia &bull; Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}</p>
        </div>
      </div>
    </div>
  );
}
