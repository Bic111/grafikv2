/**
 * Table component
 * Reusable data table with headers and rows
 */

import React from 'react';

export interface TableColumn<T> {
  /** Unique column identifier */
  key: string;
  /** Column header label */
  label: string;
  /** How to render the cell value */
  render?: (value: T) => React.ReactNode;
  /** Optional CSS class for column styling */
  className?: string;
  /** Whether column is sortable */
  sortable?: boolean;
}

export interface TableProps<T> {
  /** Array of data to display */
  data: T[];
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Unique key field for each row */
  keyField: keyof T;
  /** Optional action column with buttons */
  actions?: {
    render: (item: T) => React.ReactNode;
    label?: string;
  };
  /** Whether table is loading */
  isLoading?: boolean;
  /** Message to display when no data */
  emptyMessage?: string;
  /** Optional className for table styling */
  className?: string;
}

/**
 * Table component
 */
export function Table<T>({
  data,
  columns,
  keyField,
  actions,
  isLoading = false,
  emptyMessage = 'Brak danych',
  className = '',
}: TableProps<T>): JSX.Element {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 ${column.className || ''}`}
              >
                {column.label}
                {column.sortable && (
                  <span className="ml-2 text-gray-400">⇅</span>
                )}
              </th>
            ))}
            {actions && (
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                {actions.label || 'Akcje'}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={String(row[keyField])}
              className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {columns.map((column) => (
                <td
                  key={`${row[keyField]}-${column.key}`}
                  className={`border-b border-gray-200 px-4 py-3 text-sm text-gray-900 ${column.className || ''}`}
                >
                  {column.render ? column.render(row) : String(row[column.key as keyof T])}
                </td>
              ))}
              {actions && (
                <td className="border-b border-gray-200 px-4 py-3 text-sm">
                  {actions.render(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Skeleton placeholder for table loading state
 */
export function TableSkeleton({
  columnCount = 4,
  rowCount = 5,
}: {
  columnCount?: number;
  rowCount?: number;
}): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            {Array.from({ length: columnCount }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <td key={colIndex} className="border-b border-gray-200 px-4 py-3">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
