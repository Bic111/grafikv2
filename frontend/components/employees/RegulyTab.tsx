import React from 'react';
import type { Rule, HourLimit } from '@/types';
import { ruleAPI, hourLimitAPI, getErrorMessage } from '@/services/api';
import { Table, TableSkeleton, ErrorMessage, ConfirmDialog, type TableSortState } from '@/components/common';
import { RuleForm, LimitForm } from './forms';
import type { RuleFormData, HourLimitFormData } from '@/types/schemas';
import { EMPLOYMENT_LABELS } from '@/types/hour-limit';

function sortRules(data: Rule[], sortState: TableSortState): Rule[] {
  const sorted = [...data];

  sorted.sort((a, b) => {
    const { columnKey, direction } = sortState;
    const orderMultiplier = direction === 'asc' ? 1 : -1;

    const valueA = String(a[columnKey as keyof Rule] ?? '').toLocaleLowerCase();
    const valueB = String(b[columnKey as keyof Rule] ?? '').toLocaleLowerCase();

    return valueA.localeCompare(valueB, 'pl') * orderMultiplier;
  });

  return sorted;
}

function sortLimits(data: HourLimit[], sortState: TableSortState): HourLimit[] {
  const sorted = [...data];

  sorted.sort((a, b) => {
    const { columnKey, direction } = sortState;
    const orderMultiplier = direction === 'asc' ? 1 : -1;

    if (columnKey === 'etat') {
      return (a.etat - b.etat) * orderMultiplier;
    }

    if (columnKey === 'max_dziennie' || columnKey === 'max_tygodniowo' || columnKey === 'max_miesięcznie' || columnKey === 'max_kwartalnie') {
      const valueA = a[columnKey as keyof HourLimit] as number || 0;
      const valueB = b[columnKey as keyof HourLimit] as number || 0;
      return (valueA - valueB) * orderMultiplier;
    }

    return 0;
  });

  return sorted;
}

type TabSection = 'list' | 'edit-rule' | 'edit-limit' | 'add-rule' | 'add-limit';

export function RegulyTab(): JSX.Element {
  // Rules state
  const [rules, setRules] = React.useState<Rule[]>([]);
  const [ruleSortState, setRuleSortState] = React.useState<TableSortState>({
    columnKey: 'nazwa',
    direction: 'asc',
  });

  // Limits state
  const [limits, setLimits] = React.useState<HourLimit[]>([]);
  const [limitSortState, setLimitSortState] = React.useState<TableSortState>({
    columnKey: 'etat',
    direction: 'asc',
  });

  // UI state
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeSection, setActiveSection] = React.useState<TabSection>('list');
  const [selectedRule, setSelectedRule] = React.useState<Rule | null>(null);
  const [selectedLimit, setSelectedLimit] = React.useState<HourLimit | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ type: 'rule' | 'limit'; item: Rule | HourLimit } | null>(null);

  React.useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [rulesData, limitsData] = await Promise.all([
        ruleAPI.getAll(),
        hourLimitAPI.getAll(),
      ]);
      setRules(rulesData);
      setLimits(limitsData);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error loading rules and limits:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Rules handlers
  const handleAddRuleClick = () => {
    setSelectedRule(null);
    setActiveSection('add-rule');
  };

  const handleEditRuleClick = (rule: Rule) => {
    setSelectedRule(rule);
    setActiveSection('edit-rule');
  };

  const handleDeleteRuleClick = (rule: Rule) => {
    setDeleteConfirm({ type: 'rule', item: rule });
  };

  const handleRuleFormSubmit = async (data: RuleFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        nazwa: data.nazwa,
        ...(data.opis ? { opis: data.opis } : {}),
        ...(data.typ ? { typ: data.typ } : {}),
      };

      if (selectedRule?.id) {
        await ruleAPI.update(selectedRule.id, payload);
      } else {
        await ruleAPI.create(payload);
      }

      await loadData();
      setActiveSection('list');
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error saving rule:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmRuleDelete = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'rule') return;

    try {
      setError(null);
      setIsSaving(true);
      await ruleAPI.delete((deleteConfirm.item as Rule).id);
      await loadData();
      setDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error deleting rule:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Limits handlers
  const handleAddLimitClick = () => {
    setSelectedLimit(null);
    setActiveSection('add-limit');
  };

  const handleEditLimitClick = (limit: HourLimit) => {
    setSelectedLimit(limit);
    setActiveSection('edit-limit');
  };

  const handleDeleteLimitClick = (limit: HourLimit) => {
    setDeleteConfirm({ type: 'limit', item: limit });
  };

  const handleLimitFormSubmit = async (data: HourLimitFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        etat: data.etat,
        ...(data.max_dziennie !== undefined ? { max_dziennie: data.max_dziennie } : {}),
        ...(data.max_tygodniowo !== undefined ? { max_tygodniowo: data.max_tygodniowo } : {}),
        ...(data.max_miesiecznie !== undefined ? { max_miesiecznie: data.max_miesiecznie } : {}),
        ...(data.max_kwartalnie !== undefined ? { max_kwartalnie: data.max_kwartalnie } : {}),
      };

      if (selectedLimit?.id) {
        await hourLimitAPI.update(selectedLimit.id, payload);
      } else {
        await hourLimitAPI.create(payload);
      }

      await loadData();
      setActiveSection('list');
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error saving limit:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLimitDelete = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'limit') return;

    try {
      setError(null);
      setIsSaving(true);
      await hourLimitAPI.delete((deleteConfirm.item as HourLimit).id);
      await loadData();
      setDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error deleting limit:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const visibleRules = React.useMemo(
    () => sortRules(rules, ruleSortState),
    [rules, ruleSortState]
  );

  const visibleLimits = React.useMemo(
    () => sortLimits(limits, limitSortState),
    [limits, limitSortState]
  );

  const handleRuleSort = (columnKey: string, direction: 'asc' | 'desc') => {
    setRuleSortState({ columnKey, direction });
  };

  const handleLimitSort = (columnKey: string, direction: 'asc' | 'desc') => {
    setLimitSortState({ columnKey, direction });
  };

  // Loading state
  if (isLoading && rules.length === 0 && limits.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Limity godzin</h3>
          <TableSkeleton columnCount={5} />
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold">Krytyczne wytyczne</h3>
          <TableSkeleton columnCount={4} />
        </div>
      </div>
    );
  }

  // Edit/Add rule form
  if (activeSection === 'add-rule' || activeSection === 'edit-rule') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {selectedRule ? 'Edytuj regułę' : 'Dodaj regułę'}
          </h2>
        </div>
        {error && <ErrorMessage message={error} />}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <RuleForm
            initialData={selectedRule ?? undefined}
            onSubmit={handleRuleFormSubmit}
            onCancel={() => setActiveSection('list')}
            isLoading={isSaving}
          />
        </div>
      </div>
    );
  }

  // Edit/Add limit form
  if (activeSection === 'add-limit' || activeSection === 'edit-limit') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {selectedLimit ? 'Edytuj limit' : 'Dodaj limit'}
          </h2>
        </div>
        {error && <ErrorMessage message={error} />}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <LimitForm
            initialData={selectedLimit ?? undefined}
            onSubmit={handleLimitFormSubmit}
            onCancel={() => setActiveSection('list')}
            isLoading={isSaving}
          />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-8">
      {/* Hour Limits Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Limity godzin</h3>
          <button
            onClick={handleAddLimitClick}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Dodaj limit
          </button>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="rounded-lg border border-gray-200 bg-white">
          <Table<HourLimit>
            data={visibleLimits}
            keyField="id"
            className="rounded-lg"
            emptyMessage="Brak zdefiniowanych limitów godzin"
            sortState={limitSortState}
            onSort={handleLimitSort}
            columns={[
              {
                key: 'etat',
                label: 'Etat',
                sortable: true,
                render: (limit) => EMPLOYMENT_LABELS[limit.etat],
              },
              {
                key: 'max_dziennie',
                label: 'Max dziennie (h)',
                sortable: true,
                render: (limit) => limit.max_dziennie ?? '—',
              },
              {
                key: 'max_tygodniowo',
                label: 'Max tydzień (h)',
                sortable: true,
                render: (limit) => limit.max_tygodniowo ?? '—',
              },
              {
                key: 'max_miesięcznie',
                label: 'Max miesiąc (h)',
                sortable: true,
                render: (limit) => limit.max_miesięcznie ?? '—',
              },
              {
                key: 'max_kwartalnie',
                label: 'Max kwartał (h)',
                sortable: true,
                render: (limit) => limit.max_kwartalnie ?? '—',
              },
            ]}
            actions={{
              render: (limit) => (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEditLimitClick(limit)}
                    title="Edytuj limit"
                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteLimitClick(limit)}
                    title="Usuń limit"
                    className="text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ),
            }}
          />
        </div>
      </div>

      {/* Rules Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Krytyczne wytyczne</h3>
          <button
            onClick={handleAddRuleClick}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Dodaj regułę
          </button>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="rounded-lg border border-gray-200 bg-white">
          <Table<Rule>
            data={visibleRules}
            keyField="id"
            className="rounded-lg"
            emptyMessage="Brak zdefiniowanych reguł"
            sortState={ruleSortState}
            onSort={handleRuleSort}
            columns={[
              {
                key: 'nazwa',
                label: 'Nazwa',
                sortable: true,
              },
              {
                key: 'typ',
                label: 'Typ',
                sortable: true,
                render: (rule) => rule.typ || '—',
              },
              {
                key: 'opis',
                label: 'Opis',
                sortable: true,
                render: (rule) => (
                  <span className="block max-w-2xl truncate" title={rule.opis || ''}>
                    {rule.opis || '—'}
                  </span>
                ),
              },
            ]}
            actions={{
              render: (rule) => (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEditRuleClick(rule)}
                    title="Edytuj regułę"
                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteRuleClick(rule)}
                    title="Usuń regułę"
                    className="text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ),
            }}
          />
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          title="Potwierdź usunięcie"
          message={
            deleteConfirm.type === 'rule'
              ? `Czy na pewno chcesz usunąć regułę "${(deleteConfirm.item as Rule).nazwa}"?`
              : `Czy na pewno chcesz usunąć limit dla etatu ${EMPLOYMENT_LABELS[(deleteConfirm.item as HourLimit).etat]}?`
          }
          confirmLabel="Usuń"
          cancelLabel="Anuluj"
          onConfirm={
            deleteConfirm.type === 'rule'
              ? handleConfirmRuleDelete
              : handleConfirmLimitDelete
          }
          onCancel={handleCancelDelete}
          variant="danger"
        />
      )}
    </div>
  );
}
