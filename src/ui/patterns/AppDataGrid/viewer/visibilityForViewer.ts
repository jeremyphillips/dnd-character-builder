import type { ViewerContext } from '@/shared/domain/capabilities'

import type { AppDataGridVisibility } from '../types'

export function isAppDataGridVisibleToViewer(
  visibility: AppDataGridVisibility | undefined,
  viewer: ViewerContext | undefined,
): boolean {
  if (!visibility?.platformAdminOnly) return true
  return Boolean(viewer?.isPlatformAdmin)
}
