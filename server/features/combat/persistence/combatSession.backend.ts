import { randomUUID } from 'node:crypto'
import type { EncounterState } from '@rpg-world-builder/mechanics'

import { CombatSession } from './combatSession.model'

export type CombatSessionRecord = {
  sessionId: string
  revision: number
  state: EncounterState
  createdAt: Date
  updatedAt: Date
}

export type CommitMutationResult =
  | { ok: true; revision: number }
  | { ok: false; reason: 'not-found' | 'stale'; currentRevision?: number }

export interface CombatSessionBackend {
  createSession(initialState: EncounterState): Promise<{ sessionId: string; revision: number }>
  getSession(sessionId: string): Promise<CombatSessionRecord | null>
  tryCommitMutation(
    sessionId: string,
    baseRevision: number,
    nextState: EncounterState,
  ): Promise<CommitMutationResult>
}

async function mongoCreateSession(initialState: EncounterState): Promise<{ sessionId: string; revision: number }> {
  const sessionId = randomUUID()
  const revision = 1
  await CombatSession.create({ sessionId, revision, state: initialState })
  return { sessionId, revision }
}

async function mongoGetSession(sessionId: string): Promise<CombatSessionRecord | null> {
  const doc = await CombatSession.findOne({ sessionId }).lean()
  if (!doc) return null
  return {
    sessionId: doc.sessionId,
    revision: doc.revision,
    state: doc.state as EncounterState,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

async function mongoTryCommitMutation(
  sessionId: string,
  baseRevision: number,
  nextState: EncounterState,
): Promise<CommitMutationResult> {
  const updated = await CombatSession.findOneAndUpdate(
    { sessionId, revision: baseRevision },
    { $set: { state: nextState, revision: baseRevision + 1 } },
    { new: true },
  ).lean()

  if (updated) {
    return { ok: true, revision: updated.revision }
  }

  const exists = await CombatSession.findOne({ sessionId }).lean()
  if (!exists) {
    return { ok: false, reason: 'not-found' }
  }
  return { ok: false, reason: 'stale', currentRevision: exists.revision }
}

const mongoCombatSessionBackend: CombatSessionBackend = {
  createSession: mongoCreateSession,
  getSession: mongoGetSession,
  tryCommitMutation: mongoTryCommitMutation,
}

export function createInMemoryCombatSessionBackend(): CombatSessionBackend {
  const sessions = new Map<string, CombatSessionRecord>()

  return {
    async createSession(initialState: EncounterState) {
      const sessionId = randomUUID()
      const revision = 1
      const now = new Date()
      sessions.set(sessionId, {
        sessionId,
        revision,
        state: initialState,
        createdAt: now,
        updatedAt: now,
      })
      return { sessionId, revision }
    },

    async getSession(sessionId: string) {
      return sessions.get(sessionId) ?? null
    },

    async tryCommitMutation(sessionId: string, baseRevision: number, nextState: EncounterState) {
      const cur = sessions.get(sessionId)
      if (!cur) {
        return { ok: false, reason: 'not-found' }
      }
      if (cur.revision !== baseRevision) {
        return { ok: false, reason: 'stale', currentRevision: cur.revision }
      }
      cur.revision = baseRevision + 1
      cur.state = nextState
      cur.updatedAt = new Date()
      return { ok: true, revision: cur.revision }
    },
  }
}

let testOverride: CombatSessionBackend | null = null

/**
 * Production uses MongoDB; tests may install an in-memory backend.
 */
export function getCombatSessionBackend(): CombatSessionBackend {
  return testOverride ?? mongoCombatSessionBackend
}

/** @internal Vitest — swap persistence before handling requests */
export function setCombatSessionBackendForTests(backend: CombatSessionBackend | null) {
  testOverride = backend
}
