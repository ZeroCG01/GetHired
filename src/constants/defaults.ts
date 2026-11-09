import { JobSourceKey, StatusItem } from '../types';

export const DEFAULT_STATUSES: StatusItem[] = [
  {
    id: 'WISHLIST',
    labelId: 'Ingin Dilamar',
    labelEn: 'Wishlist',
    colorKey: 'slate',
    group: 'ACTIVE',
    sortOrder: 1,
    isDefault: true,
  },
  {
    id: 'APPLIED',
    labelId: 'Sudah Melamar',
    labelEn: 'Applied',
    colorKey: 'blue',
    group: 'ACTIVE',
    sortOrder: 2,
    isDefault: true,
  },
  {
    id: 'SCREENING',
    labelId: 'Screening',
    labelEn: 'Screening',
    colorKey: 'purple',
    group: 'ACTIVE',
    sortOrder: 3,
    isDefault: true,
  },
  {
    id: 'INTERVIEW',
    labelId: 'Interview',
    labelEn: 'Interview',
    colorKey: 'amber',
    group: 'ACTIVE',
    sortOrder: 4,
    isDefault: true,
  },
  {
    id: 'TEST',
    labelId: 'Technical Test',
    labelEn: 'Technical Test',
    colorKey: 'indigo',
    group: 'ACTIVE',
    sortOrder: 5,
    isDefault: true,
  },
  {
    id: 'OFFERING',
    labelId: 'Offering',
    labelEn: 'Offering',
    colorKey: 'emerald',
    group: 'ACTIVE',
    sortOrder: 6,
    isDefault: true,
  },
  {
    id: 'ACCEPTED',
    labelId: 'Diterima',
    labelEn: 'Accepted',
    colorKey: 'cyan',
    group: 'COMPLETED',
    sortOrder: 7,
    isDefault: true,
  },
  {
    id: 'REJECTED',
    labelId: 'Ditolak',
    labelEn: 'Rejected',
    colorKey: 'rose',
    group: 'COMPLETED',
    sortOrder: 8,
    isDefault: true,
  },
  {
    id: 'GHOSTED',
    labelId: 'Tidak Ada Kabar',
    labelEn: 'Ghosted',
    colorKey: 'slate',
    group: 'COMPLETED',
    sortOrder: 9,
    isDefault: true,
  },
  {
    id: 'WITHDRAWN',
    labelId: 'Mundur',
    labelEn: 'Withdrawn',
    colorKey: 'orange',
    group: 'COMPLETED',
    sortOrder: 10,
    isDefault: true,
  },
];

export interface JobSourceDefinition {
  key: JobSourceKey;
  labelId: string;
  labelEn: string;
  iconName: string; // Ionicons name
}

export const JOB_SOURCES: JobSourceDefinition[] = [
  { key: 'LINKEDIN', labelId: 'LinkedIn', labelEn: 'LinkedIn', iconName: 'logo-linkedin' },
  { key: 'JOBSTREET', labelId: 'Jobstreet', labelEn: 'Jobstreet', iconName: 'briefcase-outline' },
  { key: 'GLINTS', labelId: 'Glints', labelEn: 'Glints', iconName: 'compass-outline' },
  { key: 'KALIBRR', labelId: 'Kalibrr', labelEn: 'Kalibrr', iconName: 'flash-outline' },
  { key: 'INDEED', labelId: 'Indeed', labelEn: 'Indeed', iconName: 'search-outline' },
  { key: 'KARIRHUB', labelId: 'Karirhub (Kemnaker)', labelEn: 'Karirhub', iconName: 'business-outline' },
  { key: 'COMPANY_WEBSITE', labelId: 'Website Perusahaan', labelEn: 'Company Website', iconName: 'globe-outline' },
  { key: 'REFERRAL', labelId: 'Rekomendasi / Teman', labelEn: 'Referral', iconName: 'people-outline' },
  { key: 'SOCIAL_MEDIA', labelId: 'Media Sosial (IG/X)', labelEn: 'Social Media', iconName: 'share-social-outline' },
  { key: 'JOB_FAIR', labelId: 'Job Fair / Event', labelEn: 'Job Fair', iconName: 'calendar-outline' },
  { key: 'OTHER', labelId: 'Lainnya', labelEn: 'Other', iconName: 'ellipsis-horizontal-outline' },
];

