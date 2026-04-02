---
name: Session turn click investigation
overview: Investigate why GameSession `/play` players see correct capabilities (enabled End turn, movement highlights, working resolve) but clicks on End turn and movement cells have no effect. The plan separates **permission/UI** (already consistent when off-turn behavior is correct) from **event delivery**, **local `applyCombatIntent` success**, and **persisted sync**, and links in-repo reference docs for agent context.
todos:
  - id: verify-grid-pan
    content: Reproduce movement click + confirm hasDragMoved / pointer bubbling (CombatGrid + useCanvasPan)
    status: pending
  - id: verify-header-click
    content: Confirm End turn onClick reaches handleNextTurn; check form/type and z-index
    status: pending
  - id: log-apply-results
    content: "Instrument handleNextTurn / handleMoveCombatant: log result.ok, error, reference equality"
    status: pending
  - id: audit-ref-hydration
    content: Audit encounterStateRef sync and hydratedEncounterState effect in useEncounterState
    status: pending
  - id: check-network-intents
    content: "Optional: Network tab for POST /intents on move/end-turn (403/409)"
    status: pending
isProject: false
---

