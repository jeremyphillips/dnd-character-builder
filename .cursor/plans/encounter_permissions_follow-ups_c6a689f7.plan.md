---
name: Encounter permissions follow-ups
overview: "Address the four follow-ups in [encounter-viewer-permissions.md](docs/reference/combat/client/encounter-viewer-permissions.md): add real server-side intent authorization (with a clear policy for game-linked vs orphan combat sessions), plan richer participant/character modeling as a separate track, remove the deprecated `EncounterViewerRole` alias once exports are migrated, and add server tests for move / resolve / end-turn across DM, controlling player, and non-controlling player."
todos: []
isProject: false
---

# Plan: Encounter viewer permission follow-ups

## Current state (relevant gaps)

- `[server/features/combat/routes/combat.routes.ts](server/features/combat/routes/combat.routes.ts)`: `GET /sessions/:se

