import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getApplications } from '../db/applications';
import { getAllStatuses } from '../db/statuses';

/**
 * Escapes a cell value for standard CSV format
 */
function escapeCsv(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports all applications to an Excel-compatible CSV file and opens the native Share sheet
 */
export async function exportApplicationsToCsv(): Promise<{ success: boolean; error?: string }> {
  try {
    const applications = getApplications();
    const statuses = getAllStatuses();
    const statusMap = new Map(statuses.map((s) => [s.id, s]));

    const headers = [
      'Company Name',
      'Position',
      'Status (ID)',
      'Status (EN)',
      'Job Source',
      'Applied Date',
      'Salary Min',
      'Salary Max',
      'Currency',
      'Salary Period',
      'Salary Type',
      'Work Type',
      'Employment Type',
      'Location',
      'Job URL',
      'Contact Name',
      'Contact Info',
      'Follow-up Date',
      'Notes',
      'Created At',
    ];

    const rows = applications.map((app) => {
      const status = statusMap.get(app.statusId);
      return [
        escapeCsv(app.companyName),
        escapeCsv(app.position),
        escapeCsv(status?.labelId || app.statusId),
        escapeCsv(status?.labelEn || app.statusId),
        escapeCsv(app.source === 'OTHER' && app.sourceOther ? app.sourceOther : app.source),
        escapeCsv(app.appliedDate),
        escapeCsv(app.salaryMin ?? ''),
        escapeCsv(app.salaryMax ?? ''),
        escapeCsv(app.salaryCurrency),
        escapeCsv(app.salaryPeriod ?? ''),
        escapeCsv(app.salaryType ?? ''),
        escapeCsv(app.workType ?? ''),
        escapeCsv(app.employmentType ?? ''),
        escapeCsv(app.location ?? ''),
        escapeCsv(app.jobUrl ?? ''),
        escapeCsv(app.contactName ?? ''),
        escapeCsv(app.contactInfo ?? ''),
        escapeCsv(app.followUpDate ?? ''),
        escapeCsv(app.notes ?? ''),
        escapeCsv(app.createdAt),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n'); // \uFEFF is UTF-8 BOM for Excel

    const fileName = `JobTrack_Applications_${new Date().toISOString().split('T')[0]}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Job Applications CSV',
        UTI: 'public.comma-separated-values-text',
      });
      return { success: true };
    } else {
      return { success: false, error: 'Sharing is not available on this device' };
    }
  } catch (err: any) {
    console.warn('Failed to export CSV:', err);
    return { success: false, error: err?.message || 'Export error' };
  }
}
