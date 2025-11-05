import { invoke } from '@tauri-apps/api/core';
import type { ScheduleEntry, Employee, Shift } from './types';

/**
 * Export schedule to CSV format
 */
export async function exportScheduleCSV(
  scheduleEntries: ScheduleEntry[],
  employees: Employee[],
  shifts: Shift[]
): Promise<string> {
  return await invoke<string>('export_schedule_csv', {
    scheduleEntries,
    employees,
    shifts,
  });
}

/**
 * Export schedule to PDF-ready HTML format
 */
export async function exportSchedulePDFHtml(
  scheduleEntries: ScheduleEntry[],
  employees: Employee[],
  shifts: Shift[],
  startDate: string,
  endDate: string
): Promise<string> {
  return await invoke<string>('export_schedule_pdf_html', {
    scheduleEntries,
    employees,
    shifts,
    startDate,
    endDate,
  });
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'grafik.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Trigger browser print dialog for PDF generation
 */
export function printPDF(htmlContent: string): void {
  // Open new window with the HTML content
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } else {
    alert('Nie można otworzyć okna drukowania. Sprawdź ustawienia blokowania wyskakujących okien.');
  }
}
