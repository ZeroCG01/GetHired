import { getDatabase } from './client';
import { StatusColorKey, StatusGroup, StatusHistoryItem, StatusItem } from '../types';
import { generateUUID } from '../utils/uuid';

interface StatusRow {
  id: string;
  label_id: string;
  label_en: string;
  color_key: string;
  group_name: string;
  sort_order: number;
  is_default: number;
  created_at: string;
}

function mapStatusRow(row: StatusRow): StatusItem {
  return {
    id: row.id,
    labelId: row.label_id,
    labelEn: row.label_en,
    colorKey: row.color_key as StatusColorKey,
    group: row.group_name as StatusGroup,
    sortOrder: row.sort_order,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
  };
}

export function getAllStatuses(): StatusItem[] {
  const db = getDatabase();
  const rows = db.getAllSync<StatusRow>(
    'SELECT * FROM statuses ORDER BY sort_order ASC, created_at ASC'
  );
  return rows.map(mapStatusRow);
}

export function getStatusById(id: string): StatusItem | null {
  const db = getDatabase();
  const row = db.getFirstSync<StatusRow>('SELECT * FROM statuses WHERE id = ?', [id]);
  return row ? mapStatusRow(row) : null;
}

export function getStatusUsageCount(statusId: string): number {
  const db = getDatabase();
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM applications WHERE status_id = ?',
    [statusId]
  );
  return result?.count ?? 0;
}

export function createCustomStatus(params: {
  labelId: string;
  labelEn: string;
  colorKey: StatusColorKey;
  group: StatusGroup;
}): StatusItem {
  const db = getDatabase();
  const id = generateUUID();
  const now = new Date().toISOString();

  // Find max sort order
  const maxOrderRow = db.getFirstSync<{ maxOrder: number | null }>(
    'SELECT MAX(sort_order) as maxOrder FROM statuses'
  );
  const nextOrder = (maxOrderRow?.maxOrder ?? 10) + 1;

  db.runSync(
    `INSERT INTO statuses (id, label_id, label_en, color_key, group_name, sort_order, is_default, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [id, params.labelId, params.labelEn, params.colorKey, params.group, nextOrder, now]
  );

  return {
    id,
    labelId: params.labelId,
    labelEn: params.labelEn,
    colorKey: params.colorKey,
    group: params.group,
    sortOrder: nextOrder,
    isDefault: false,
    createdAt: now,
  };
}

export function updateCustomStatus(
  id: string,
  params: {
    labelId?: string;
    labelEn?: string;
    colorKey?: StatusColorKey;
    group?: StatusGroup;
  }
): void {
  const db = getDatabase();
  const current = getStatusById(id);
  if (!current) return;

  const labelId = params.labelId ?? current.labelId;
  const labelEn = params.labelEn ?? current.labelEn;
  const colorKey = params.colorKey ?? current.colorKey;
  const group = params.group ?? current.group;

  db.runSync(
    `UPDATE statuses
     SET label_id = ?, label_en = ?, color_key = ?, group_name = ?
     WHERE id = ?`,
    [labelId, labelEn, colorKey, group, id]
  );
}

export function deleteCustomStatus(id: string): {
  success: boolean;
  errorReason?: 'IS_DEFAULT' | 'IN_USE';
  usedCount?: number;
} {
  const db = getDatabase();
  const status = getStatusById(id);
  if (!status) return { success: false };

  if (status.isDefault) {
    return { success: false, errorReason: 'IS_DEFAULT' };
  }

  const usageCount = getStatusUsageCount(id);
  if (usageCount > 0) {
    return { success: false, errorReason: 'IN_USE', usedCount: usageCount };
  }

  db.runSync('DELETE FROM statuses WHERE id = ?', [id]);
  return { success: true };
}

interface StatusHistoryRow {
  id: string;
  application_id: string;
  from_status_id: string | null;
  to_status_id: string;
  changed_at: string;
  note: string | null;
  from_label_id?: string | null;
  from_label_en?: string | null;
  from_color_key?: string | null;
  from_group_name?: string | null;
  to_label_id: string;
  to_label_en: string;
  to_color_key: string;
  to_group_name: string;
}

export function getStatusHistoryByApplicationId(applicationId: string): StatusHistoryItem[] {
  const db = getDatabase();
  const rows = db.getAllSync<StatusHistoryRow>(
    `SELECT 
       h.*,
       fs.label_id as from_label_id, fs.label_en as from_label_en, fs.color_key as from_color_key, fs.group_name as from_group_name,
       ts.label_id as to_label_id, ts.label_en as to_label_en, ts.color_key as to_color_key, ts.group_name as to_group_name
     FROM status_history h
     LEFT JOIN statuses fs ON h.from_status_id = fs.id
     JOIN statuses ts ON h.to_status_id = ts.id
     WHERE h.application_id = ?
     ORDER BY datetime(h.changed_at) DESC`,
    [applicationId]
  );

  return rows.map((r) => ({
    id: r.id,
    applicationId: r.application_id,
    fromStatusId: r.from_status_id,
    toStatusId: r.to_status_id,
    changedAt: r.changed_at,
    note: r.note,
    fromStatus: r.from_status_id
      ? {
          id: r.from_status_id,
          labelId: r.from_label_id ?? '',
          labelEn: r.from_label_en ?? '',
          colorKey: (r.from_color_key ?? 'slate') as StatusColorKey,
          group: (r.from_group_name ?? 'ACTIVE') as StatusGroup,
          sortOrder: 0,
          isDefault: true,
        }
      : null,
    toStatus: {
      id: r.to_status_id,
      labelId: r.to_label_id,
      labelEn: r.to_label_en,
      colorKey: (r.to_color_key ?? 'slate') as StatusColorKey,
      group: (r.to_group_name ?? 'ACTIVE') as StatusGroup,
      sortOrder: 0,
      isDefault: true,
    },
  }));
}

export function addStatusHistory(params: {
  applicationId: string;
  fromStatusId: string | null;
  toStatusId: string;
  note?: string | null;
  changedAt?: string;
}): StatusHistoryItem {
  const db = getDatabase();
  const id = generateUUID();
  const changedAt = params.changedAt ?? new Date().toISOString();

  db.runSync(
    `INSERT INTO status_history (id, application_id, from_status_id, to_status_id, changed_at, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, params.applicationId, params.fromStatusId, params.toStatusId, changedAt, params.note ?? null]
  );

  const toStatus = getStatusById(params.toStatusId);
  const fromStatus = params.fromStatusId ? getStatusById(params.fromStatusId) : null;

  return {
    id,
    applicationId: params.applicationId,
    fromStatusId: params.fromStatusId,
    toStatusId: params.toStatusId,
    changedAt,
    note: params.note ?? null,
    fromStatus,
    toStatus: toStatus!,
  };
}

