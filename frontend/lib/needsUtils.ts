// Category icons mapped to category IDs
export const CATEGORY_ICONS: Record<string, string> = {
  edu:       '🏫',
  water:     '💧',
  health:    '🏥',
  power:     '⚡',
  roads:     '🛣️',
  security:  '🛡️',
  waste:     '🗑️',
  transport: '🚌',
  jobs:      '💼',
  markets:   '🛒',
  housing:   '🏠',
  agri:      '🌾',
  youth:     '⚽',
  env:       '🌊',
  others:    '📌',
};

export function getCategoryIcon(categoryId?: string | null): string {
  if (!categoryId) return '📌';
  return CATEGORY_ICONS[categoryId] ?? '📌';
}

// Status config returns TailwindCSS classes + display key
export interface StatusConfig {
  label: string;
  dot: string;   // bg color for the dot
  bg: string;    // background of badge
  text: string;  // text color of badge
  emoji: string;
}

export function getStatusConfig(
  status: string,
  t: (key: string) => string
): StatusConfig {
  switch (status) {
    case 'In Review':
      return { label: t('inReview'),    dot: 'bg-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-300',   emoji: '🔵' };
    case 'In Progress':
      return { label: t('inProgress'),  dot: 'bg-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', emoji: '🟠' };
    case 'Resolved':
    case 'Fulfilled':
      return { label: t('resolved'),    dot: 'bg-green-500',  bg: 'bg-green-50 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-300',  emoji: '🟢' };
    default: // Submitted
      return { label: t('submitted'),   dot: 'bg-yellow-400 animate-pulse', bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', emoji: '🟡' };
  }
}
