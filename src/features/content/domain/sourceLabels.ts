/**
 * Centralized source display labels for content (system vs campaign).
 * UI-only mapping — stored values remain 'system' and 'campaign'.
 */

/** Value => display label for content source. */
export const CONTENT_SOURCE_LABELS: Record<string, string> = {
  system: 'System',
  campaign: 'Homebrew',
};

/** Options for the Source select filter (AppDataGrid). */
export const SOURCE_FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'System', value: 'system' },
  { label: 'Homebrew', value: 'campaign' },
] as const;

/**
 * Format a content source value for display.
 * - 'system' or undefined/null => "System"
 * - 'campaign' => "Homebrew"
 * - unknown values => String(value) or '—'
 */
export function formatContentSource(
  source: string | null | undefined
): string {
  if (source == null || source === '') return 'System';
  const label = CONTENT_SOURCE_LABELS[source];
  if (label != null) return label;
  return source || '—';
}
