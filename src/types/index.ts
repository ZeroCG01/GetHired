export type ThemeMode = 'dark' | 'light' | 'system';
export type AppLanguage = 'id' | 'en';

export type StatusGroup = 'ACTIVE' | 'COMPLETED';

export type StatusColorKey =
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'indigo'
  | 'emerald'
  | 'amber'
  | 'orange'
  | 'rose'
  | 'slate';

export interface StatusItem {
  id: string; // e.g. 'APPLIED', 'INTERVIEW', or UUID for custom
  labelId: string; // Indonesian label
  labelEn: string; // English label
  colorKey: StatusColorKey;
  group: StatusGroup;
  sortOrder: number;
  isDefault: boolean; // true for standard 10 statuses, false for user custom
  createdAt?: string;
}

export type JobSourceKey =
  | 'LINKEDIN'
  | 'JOBSTREET'
  | 'GLINTS'
  | 'KALIBRR'
  | 'INDEED'
  | 'KARIRHUB'
  | 'COMPANY_WEBSITE'
  | 'REFERRAL'
  | 'SOCIAL_MEDIA'
  | 'JOB_FAIR'
  | 'OTHER';

export type SalaryPeriod = 'MONTHLY' | 'YEARLY';
export type SalaryType = 'POSTED' | 'EXPECTED' | 'OFFERED';
export type WorkType = 'ONSITE' | 'HYBRID' | 'REMOTE';
export type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE' | 'PART_TIME';

export interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  source: string; // JobSourceKey or custom
  sourceOther?: string | null;
  statusId: string; // references StatusItem.id
  appliedDate: string; // YYYY-MM-DD
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency: string; // default 'IDR'
  salaryPeriod?: SalaryPeriod | null;
  salaryType?: SalaryType | null;
  workType?: WorkType | null;
  employmentType?: EmploymentType | null;
  location?: string | null;
  jobUrl?: string | null;
  contactName?: string | null;
  contactInfo?: string | null;
  followUpDate?: string | null; // YYYY-MM-DD
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  // joined status details for convenience
  status?: StatusItem;
}

export interface StatusHistoryItem {
  id: string;
  applicationId: string;
  fromStatusId: string | null;
  toStatusId: string;
  changedAt: string; // ISO string or YYYY-MM-DD HH:mm
  note?: string | null;
  fromStatus?: StatusItem | null;
  toStatus?: StatusItem | null;
}

export type ApplicationFilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED';

export type ApplicationSortBy =
  | 'applied_desc'
  | 'applied_asc'
  | 'company_asc'
  | 'company_desc'
  | 'updated_desc';

