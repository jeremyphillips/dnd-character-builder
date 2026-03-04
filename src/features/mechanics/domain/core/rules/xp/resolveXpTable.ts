import { XP_TABLES } from '@/features/mechanics/domain/core/progression/xp';
import { resolveXpTableId } from './resolveXpTableId';

export function resolveXpTable(
  xpConfig: Parameters<typeof resolveXpTableId>[0],
  classId?: Parameters<typeof resolveXpTableId>[1]
) {
  const id = resolveXpTableId(xpConfig, classId);
  return XP_TABLES[id];
}