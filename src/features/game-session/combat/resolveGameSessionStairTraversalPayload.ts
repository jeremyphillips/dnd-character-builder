import type { EncounterState } from '@/features/mechanics/domain/combat';
import type { GameSession } from '../domain/game-session.types';
import {
  resolveEncounterStairTraversalPayload,
  _internal,
  type ResolveEncounterStairTraversalPayloadArgs,
} from '@/features/encounter/combat/resolveEncounterStairTraversalPayload';

export type { ResolveEncounterStairTraversalPayloadArgs };

/**
 * @deprecated Prefer {@link resolveEncounterStairTraversalPayload} with `locationContext: session.location`.
 * Kept for call sites that already pass a {@link GameSession}.
 */
export async function resolveGameSessionStairTraversalPayload(args: {
  campaignId: string;
  session: GameSession;
  locations: ResolveEncounterStairTraversalPayloadArgs['locations'];
  encounterState: EncounterState | null;
}) {
  const { campaignId, session, locations, encounterState } = args;
  return resolveEncounterStairTraversalPayload({
    campaignId,
    locations,
    locationContext: session.location,
    encounterState,
  });
}

export { _internal };
