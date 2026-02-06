# D&D Character Builder

A work-in-progress Dungeons & Dragons character builder focused on edition-aware rules, campaign-specific overrides, and structured class / subclass selection.

This project is currently in active development and undergoing a UI refactor toward a step-based modal flow.

## Overview

The goal of this project is to provide a flexible character builder that:
- Supports multiple D&D editions (e.g. 1e, 2e, 5e)
- Applies campaign-specific rules (race/class adds & removals)
- Handles edition-specific class structures, including 2e groupings
- Produces clean, human-readable character output suitable for prompts or downstream tools
- At present, the UI is implemented as a single reactive form. A step-by-step modal wizard refactor is planned.

## Tech Stack
### Frontend
- React
- TypeScript
- Vite

### Backend
- Node.js
- Express
- node-fetch
- dotenv

### Tooling
- ESLint
- Nodemon
- Concurrently

## Getting Started
### Install dependencies
```bash
yarn
```

### Run development servers
Runs frontend (Vite) and backend (Express) concurrently:
```bash
yarn dev
```

### Run frontend only
Runs frontend (Vite) and backend (Express) concurrently:
```bash
yarn dev:frontend
```

### Run backend only
Runs frontend (Vite) and backend (Express) concurrently:
```bash
yarn dev:backend
```

## Project Structure (High-Level)
```
/src
  /data        # Editions, campaigns, races, classes
  /helpers     # Option resolution, overrides, lookup helpers
  /components  # React components (Form, selects, etc.)
server/
  index.js     # Express server
```

## Current features
- Edition-based filtering for races and classes
- Campaign-specific overrides:
  - Add / remove races
  - Add / remove classes
- Automatic defaulting when only one valid option exists
- Support for edition-specific class behavior (e.g. 2e class groupings)
- Subclass selection when applicable

## Known limitations
- UI is currently a single reactive form
- Complex dependency logic is managed via effects and memoization
- Power-user friendly, but not beginner-friendly yet
- No persistence or saved characters

## Planned Work
- Refactor UI to a step-by-step modal wizard
- Centralize character draft state
- Simplify override application per step
- Improve validation and reset logic between steps
- Add extensibility for future character options (backgrounds, equipment, etc.)