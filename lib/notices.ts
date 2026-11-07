export type NoticeCategory = 
  | 'GENERAL' 
  | 'EXAMINATION' 
  | 'RESULT' 
  | 'ADMISSION' 
  | 'IMPORTANT' 
  | 'OTHER';

export type NoticeStatus = 'DRAFT' | 'PUBLISHED';
export type NoticeEffectiveStatus = 'ACTIVE' | 'SCHEDULED' | 'DRAFT' | 'EXPIRED' | 'DELETED';

export interface NoticeItem {
  id: number;
  title: string;
  short_description: string;
  content: string;
  category: NoticeCategory;
  status: NoticeStatus;
  is_published: boolean;
  publish_date: string;
  expiry_date: string | null;
  is_deleted?: boolean;
  created_by?: number | null;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
  effective_status?: NoticeEffectiveStatus;
  is_active_published?: boolean;
  is_expired?: boolean;
  is_scheduled?: boolean;
}

export const NOTICE_CATEGORIES: { value: NoticeCategory; label: string; badgeClass: string }[] = [
  { value: 'GENERAL', label: 'General', badgeClass: 'bg-slate-100 text-slate-800 border-slate-200' },
  { value: 'EXAMINATION', label: 'Examination', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'RESULT', label: 'Result', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'ADMISSION', label: 'Admission', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'IMPORTANT', label: 'Important', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' },
  { value: 'OTHER', label: 'Other', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
];

export function getCategoryBadgeClass(category: string): string {
  const match = NOTICE_CATEGORIES.find(c => c.value === category?.toUpperCase());
  return match ? match.badgeClass : 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getCategoryLabel(category: string): string {
  const match = NOTICE_CATEGORIES.find(c => c.value === category?.toUpperCase());
  return match ? match.label : category || 'General';
}

export function formatNoticeDate(isoStr?: string | null): string {
  if (!isoStr) return 'N/A';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

export function formatNoticeDateShort(isoStr?: string | null): string {
  if (!isoStr) return 'N/A';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoStr;
  }
}
