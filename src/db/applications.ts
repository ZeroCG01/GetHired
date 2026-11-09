import { getDatabase } from './client';
import {
  ApplicationFilterTab,
  ApplicationSortBy,
  JobApplication,
  SalaryPeriod,
  SalaryType,
  StatusColorKey,
  StatusGroup,
  StatusItem,
  WorkType,
  EmploymentType,
} from '../types';
import { generateUUID } from '../utils/uuid';
import { addStatusHistory } from './statuses';

interface ApplicationRow {
  id: string;
  company_name: string;
  position: string;
  source: string;
  source_other: string | null;
  status_id: string;
  applied_date: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_period: string | null;
  salary_type: string | null;
  work_type: string | null;
  employment_type: string | null;
  location: string | null;
  job_url: string | null;
  contact_name: string | null;
  contact_info: string | null;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined status fields
  status_label_id: string;
  status_label_en: string;
  status_color_key: string;
  status_group_name: string;
  status_sort_order: number;
  status_is_default: number;
}

function mapApplicationRow(r: ApplicationRow): JobApplication {
  const status: StatusItem = {
    id: r.status_id,
    labelId: r.status_label_id,
    labelEn: r.status_label_en,
    colorKey: (r.status_color_key || 'slate') as StatusColorKey,
    group: (r.status_group_name || 'ACTIVE') as StatusGroup,
    sortOrder: r.status_sort_order,
    isDefault: r.status_is_default === 1,
  };

  return {
    id: r.id,
    companyName: r.company_name,
    position: r.position,
    source: r.source,
    sourceOther: r.source_other,
    statusId: r.status_id,
    appliedDate: r.applied_date,
    salaryMin: r.salary_min,
    salaryMax: r.salary_max,
    salaryCurrency: r.salary_currency || 'IDR',
    salaryPeriod: r.salary_period as SalaryPeriod | null,
    salaryType: r.salary_type as SalaryType | null,
    workType: r.work_type as WorkType | null,
    employmentType: r.employment_type as EmploymentType | null,
    location: r.location,
    jobUrl: r.job_url,
    contactName: r.contact_name,
    contactInfo: r.contact_info,
    followUpDate: r.follow_up_date,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    status,
  };
}

export function getApplications(options?: {
  tab?: ApplicationFilterTab;
  search?: string;
  source?: string;
  statusId?: string;
  sortBy?: ApplicationSortBy;
}): JobApplication[] {
  const db = getDatabase();

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (options?.tab === 'ACTIVE') {
    conditions.push('s.group_name = ?');
    params.push('ACTIVE');
  } else if (options?.tab === 'COMPLETED') {
    conditions.push('s.group_name = ?');
    params.push('COMPLETED');
  }

  if (options?.search && options.search.trim().length > 0) {
    conditions.push('(a.company_name LIKE ? OR a.position LIKE ?)');
    const searchTerm = `%${options.search.trim()}%`;
    params.push(searchTerm, searchTerm);
  }

  if (options?.source && options.source !== 'ALL') {
    conditions.push('a.source = ?');
    params.push(options.source);
  }

  if (options?.statusId && options.statusId !== 'ALL') {
    conditions.push('a.status_id = ?');
    params.push(options.statusId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'ORDER BY a.applied_date DESC, a.created_at DESC';
  switch (options?.sortBy) {
    case 'applied_asc':
      orderBy = 'ORDER BY a.applied_date ASC, a.created_at ASC';
      break;
    case 'company_asc':
      orderBy = 'ORDER BY a.company_name COLLATE NOCASE ASC';
      break;
    case 'company_desc':
      orderBy = 'ORDER BY a.company_name COLLATE NOCASE DESC';
      break;
    case 'updated_desc':
      orderBy = 'ORDER BY a.updated_at DESC';
      break;
    case 'applied_desc':
    default:
      orderBy = 'ORDER BY a.applied_date DESC, a.created_at DESC';
      break;
  }

  const query = `
    SELECT 
      a.*,
      s.label_id as status_label_id,
      s.label_en as status_label_en,
      s.color_key as status_color_key,
      s.group_name as status_group_name,
      s.sort_order as status_sort_order,
      s.is_default as status_is_default
    FROM applications a
    JOIN statuses s ON a.status_id = s.id
    ${whereClause}
    ${orderBy}
  `;

  const rows = db.getAllSync<ApplicationRow>(query, params);
  return rows.map(mapApplicationRow);
}

export function getApplicationById(id: string): JobApplication | null {
  const db = getDatabase();
  const query = `
    SELECT 
      a.*,
      s.label_id as status_label_id,
      s.label_en as status_label_en,
      s.color_key as status_color_key,
      s.group_name as status_group_name,
      s.sort_order as status_sort_order,
      s.is_default as status_is_default
    FROM applications a
    JOIN statuses s ON a.status_id = s.id
    WHERE a.id = ?
  `;

  const row = db.getFirstSync<ApplicationRow>(query, [id]);
  return row ? mapApplicationRow(row) : null;
}

export function checkDuplicateApplication(
  companyName: string,
  position: string,
  excludeId?: string
): boolean {
  const db = getDatabase();
  const query = excludeId
    ? `SELECT COUNT(*) as count FROM applications 
       WHERE LOWER(TRIM(company_name)) = LOWER(TRIM(?)) 
         AND LOWER(TRIM(position)) = LOWER(TRIM(?)) 
         AND id != ?`
    : `SELECT COUNT(*) as count FROM applications 
       WHERE LOWER(TRIM(company_name)) = LOWER(TRIM(?)) 
         AND LOWER(TRIM(position)) = LOWER(TRIM(?))`;

  const params = excludeId
    ? [companyName, position, excludeId]
    : [companyName, position];

  const result = db.getFirstSync<{ count: number }>(query, params);
  return (result?.count ?? 0) > 0;
}

export function createApplication(
  data: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): JobApplication {
  const db = getDatabase();
  const id = generateUUID();
  const now = new Date().toISOString();

  db.runSync(
    `INSERT INTO applications (
      id, company_name, position, source, source_other, status_id, applied_date,
      salary_min, salary_max, salary_currency, salary_period, salary_type,
      work_type, employment_type, location, job_url, contact_name, contact_info,
      follow_up_date, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.companyName.trim(),
      data.position.trim(),
      data.source,
      data.sourceOther ?? null,
      data.statusId,
      data.appliedDate,
      data.salaryMin ?? null,
      data.salaryMax ?? null,
      data.salaryCurrency || 'IDR',
      data.salaryPeriod ?? null,
      data.salaryType ?? null,
      data.workType ?? null,
      data.employmentType ?? null,
      data.location ?? null,
      data.jobUrl ?? null,
      data.contactName ?? null,
      data.contactInfo ?? null,
      data.followUpDate ?? null,
      data.notes ?? null,
      now,
      now,
    ]
  );

  // Automatically record initial status in history
  addStatusHistory({
    applicationId: id,
    fromStatusId: null,
    toStatusId: data.statusId,
    note: 'Initial application logged',
    changedAt: data.appliedDate ? `${data.appliedDate}T00:00:00.000Z` : now,
  });

  return getApplicationById(id)!;
}

export function updateApplication(
  id: string,
  data: Partial<Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'>>
): void {
  const db = getDatabase();
  const existing = getApplicationById(id);
  if (!existing) return;

  const now = new Date().toISOString();

  // If status changed, record in status history
  if (data.statusId && data.statusId !== existing.statusId) {
    addStatusHistory({
      applicationId: id,
      fromStatusId: existing.statusId,
      toStatusId: data.statusId,
      note: 'Status updated from edit screen',
      changedAt: now,
    });
  }

  db.runSync(
    `UPDATE applications SET
      company_name = ?,
      position = ?,
      source = ?,
      source_other = ?,
      status_id = ?,
      applied_date = ?,
      salary_min = ?,
      salary_max = ?,
      salary_currency = ?,
      salary_period = ?,
      salary_type = ?,
      work_type = ?,
      employment_type = ?,
      location = ?,
      job_url = ?,
      contact_name = ?,
      contact_info = ?,
      follow_up_date = ?,
      notes = ?,
      updated_at = ?
    WHERE id = ?`,
    [
      data.companyName !== undefined ? data.companyName.trim() : existing.companyName,
      data.position !== undefined ? data.position.trim() : existing.position,
      data.source !== undefined ? data.source : existing.source,
      data.sourceOther !== undefined ? (data.sourceOther ?? null) : (existing.sourceOther ?? null),
      data.statusId !== undefined ? data.statusId : existing.statusId,
      data.appliedDate !== undefined ? data.appliedDate : existing.appliedDate,
      data.salaryMin !== undefined ? (data.salaryMin ?? null) : (existing.salaryMin ?? null),
      data.salaryMax !== undefined ? (data.salaryMax ?? null) : (existing.salaryMax ?? null),
      data.salaryCurrency !== undefined ? (data.salaryCurrency || 'IDR') : (existing.salaryCurrency || 'IDR'),
      data.salaryPeriod !== undefined ? (data.salaryPeriod ?? null) : (existing.salaryPeriod ?? null),
      data.salaryType !== undefined ? (data.salaryType ?? null) : (existing.salaryType ?? null),
      data.workType !== undefined ? (data.workType ?? null) : (existing.workType ?? null),
      data.employmentType !== undefined ? (data.employmentType ?? null) : (existing.employmentType ?? null),
      data.location !== undefined ? (data.location ?? null) : (existing.location ?? null),
      data.jobUrl !== undefined ? (data.jobUrl ?? null) : (existing.jobUrl ?? null),
      data.contactName !== undefined ? (data.contactName ?? null) : (existing.contactName ?? null),
      data.contactInfo !== undefined ? (data.contactInfo ?? null) : (existing.contactInfo ?? null),
      data.followUpDate !== undefined ? (data.followUpDate ?? null) : (existing.followUpDate ?? null),
      data.notes !== undefined ? (data.notes ?? null) : (existing.notes ?? null),
      now,
      id,
    ]
  );
}

export function updateApplicationStatus(
  id: string,
  newStatusId: string,
  note?: string | null,
  changedAtDate?: string
): void {
  const db = getDatabase();
  const existing = getApplicationById(id);
  if (!existing || existing.statusId === newStatusId) return;

  const now = new Date().toISOString();
  const changedAt = changedAtDate || now;

  addStatusHistory({
    applicationId: id,
    fromStatusId: existing.statusId,
    toStatusId: newStatusId,
    note: note ?? null,
    changedAt,
  });

  db.runSync(
    'UPDATE applications SET status_id = ?, updated_at = ? WHERE id = ?',
    [newStatusId, now, id]
  );
}

export function deleteApplication(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM applications WHERE id = ?', [id]);
}

export function getApplicationStats(): {
  total: number;
  active: number;
  interviewOrTest: number;
  responseRate: number;
  statusCounts: { status: StatusItem; count: number }[];
  sourceCounts: { source: string; total: number; active: number }[];
} {
  const db = getDatabase();

  const totalRow = db.getFirstSync<{ total: number }>('SELECT COUNT(*) as total FROM applications');
  const total = totalRow?.total ?? 0;

  const activeRow = db.getFirstSync<{ active: number }>(
    `SELECT COUNT(*) as active 
     FROM applications a 
     JOIN statuses s ON a.status_id = s.id 
     WHERE s.group_name = 'ACTIVE'`
  );
  const active = activeRow?.active ?? 0;

  const interviewRow = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count 
     FROM applications 
     WHERE status_id IN ('INTERVIEW', 'TEST')`
  );
  const interviewOrTest = interviewRow?.count ?? 0;

  // Response rate: applications that progressed beyond WISHLIST and APPLIED
  const respondedRow = db.getFirstSync<{ responded: number }>(
    `SELECT COUNT(*) as responded 
     FROM applications 
     WHERE status_id NOT IN ('WISHLIST', 'APPLIED')`
  );
  const responded = respondedRow?.responded ?? 0;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  // Status breakdown
  const statusRows = db.getAllSync<{
    status_id: string;
    label_id: string;
    label_en: string;
    color_key: string;
    group_name: string;
    sort_order: number;
    is_default: number;
    count: number;
  }>(
    `SELECT 
       s.id as status_id, s.label_id, s.label_en, s.color_key, s.group_name, s.sort_order, s.is_default,
       COUNT(a.id) as count
     FROM statuses s
     LEFT JOIN applications a ON s.id = a.status_id
     GROUP BY s.id
     ORDER BY s.sort_order ASC`
  );

  const statusCounts = statusRows.map((r) => ({
    status: {
      id: r.status_id,
      labelId: r.label_id,
      labelEn: r.label_en,
      colorKey: (r.color_key || 'slate') as StatusColorKey,
      group: (r.group_name || 'ACTIVE') as StatusGroup,
      sortOrder: r.sort_order,
      isDefault: r.is_default === 1,
    },
    count: r.count,
  }));

  // Source breakdown
  const sourceRows = db.getAllSync<{
    source: string;
    total: number;
    active: number;
  }>(
    `SELECT 
       a.source,
       COUNT(a.id) as total,
       SUM(CASE WHEN s.group_name = 'ACTIVE' THEN 1 ELSE 0 END) as active
     FROM applications a
     JOIN statuses s ON a.status_id = s.id
     GROUP BY a.source
     ORDER BY total DESC`
  );

  return {
    total,
    active,
    interviewOrTest,
    responseRate,
    statusCounts,
    sourceCounts: sourceRows,
  };
}

export function clearAllData(): void {
  const db = getDatabase();
  db.runSync('DELETE FROM status_history');
  db.runSync('DELETE FROM applications');
  db.runSync('DELETE FROM statuses WHERE is_default = 0');
}

/**
 * Seeds realistic sample data matching the jobmetry.app reference
 */
export function seedSampleData(): void {
  const db = getDatabase();
  const countRow = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM applications');
  if ((countRow?.count ?? 0) > 0) {
    clearAllData();
  }

  const sampleApps = [
    {
      companyName: 'Unilever',
      position: 'Marketing Manager',
      source: 'LINKEDIN',
      statusId: 'SCREENING',
      appliedDate: '2026-03-04',
      location: 'Jakarta',
      workType: 'HYBRID' as WorkType,
      employmentType: 'FULL_TIME' as EmploymentType,
      salaryMin: 12000000,
      salaryMax: 15000000,
      salaryCurrency: 'IDR',
      salaryType: 'EXPECTED' as SalaryType,
      salaryPeriod: 'MONTHLY' as SalaryPeriod,
      notes: 'Tahap screening CV dan profile check oleh Talent Acquisition.',
    },
    {
      companyName: 'Accenture',
      position: 'Account Executive',
      source: 'GLINTS',
      statusId: 'SCREENING',
      appliedDate: '2026-03-02',
      location: 'Jakarta',
      workType: 'ONSITE' as WorkType,
      employmentType: 'FULL_TIME' as EmploymentType,
      salaryMin: 10000000,
      salaryMax: 14000000,
      salaryCurrency: 'IDR',
      salaryType: 'POSTED' as SalaryType,
      salaryPeriod: 'MONTHLY' as SalaryPeriod,
      notes: 'Melamar via Glints, jadwal recruiter call minggu depan.',
    },
    {
      companyName: 'Siloam Hospitals',
      position: 'Registered Nurse',
      source: 'JOBSTREET',
      statusId: 'OFFERING',
      appliedDate: '2026-02-18',
      location: 'Bandung',
      workType: 'ONSITE' as WorkType,
      employmentType: 'FULL_TIME' as EmploymentType,
      salaryMin: 7000000,
      salaryMax: 9000000,
      salaryCurrency: 'IDR',
      salaryType: 'OFFERED' as SalaryType,
      salaryPeriod: 'MONTHLY' as SalaryPeriod,
      notes: 'Sudah offering letter, sedang review benefit asuransi dan penempatan.',
    },
    {
      companyName: 'Bank Mandiri',
      position: 'Relationship Manager',
      source: 'LINKEDIN',
      statusId: 'APPLIED',
      appliedDate: '2026-02-28',
      location: 'Jakarta',
      workType: 'ONSITE' as WorkType,
      employmentType: 'FULL_TIME' as EmploymentType,
      salaryMin: 9000000,
      salaryMax: 12000000,
      salaryCurrency: 'IDR',
      salaryType: 'EXPECTED' as SalaryType,
      salaryPeriod: 'MONTHLY' as SalaryPeriod,
      notes: 'Submit berkas online, menunggu konfirmasi psikotes.',
    },
    {
      companyName: 'Ruangguru',
      position: 'Content Specialist',
      source: 'REFERRAL',
      statusId: 'INTERVIEW',
      appliedDate: '2026-02-12',
      location: 'Surabaya',
      workType: 'REMOTE' as WorkType,
      employmentType: 'CONTRACT' as EmploymentType,
      salaryMin: 8000000,
      salaryMax: 10000000,
      salaryCurrency: 'IDR',
      salaryType: 'EXPECTED' as SalaryType,
      salaryPeriod: 'MONTHLY' as SalaryPeriod,
      notes: 'Rekomendasi dari teman kampus, wawancara user via Google Meet.',
    },
    {
      companyName: 'IKEA Indonesia',
      position: 'Sales Associate',
      source: 'COMPANY_WEBSITE',
      statusId: 'REJECTED',
      appliedDate: '2026-01-30',
      location: 'Tangerang',
      workType: 'HYBRID' as WorkType,
      employmentType: 'FULL_TIME' as EmploymentType,
      salaryMin: 5000000,
      salaryMax: 6500000,
      salaryCurrency: 'IDR',
      salaryType: 'POSTED' as SalaryType,
      salaryPeriod: 'MONTHLY' as SalaryPeriod,
      notes: 'Dapat email pemberitahuan bahwa posisi telah terisi kandidat internal.',
    },
  ];

  for (const item of sampleApps) {
    createApplication(item);
  }
}
