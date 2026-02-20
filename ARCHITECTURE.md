# Architecture Diagram

## New Modular Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GAME SERVER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                   ServerPlayer                            │   │
│  │  - Owns and orchestrates all player systems              │   │
│  │  - Provides clean API for game logic                     │   │
│  │  - Server-authoritative                                  │   │
│  │                                                            │   │
│  │  ┌──────────────────┐  ┌──────────────────┐             │   │
│  │  │  PlayerStats     │  │  PlayerHealth    │             │   │
│  │  ├──────────────────┤  ├──────────────────┤             │   │
│  │  │ - hp, hpMax      │  │ - regen logic    │             │   │
│  │  │ - damage         │  │ - damage cooldown│             │   │
│  │  │ - speed          │  │ - healing system │             │   │
│  │  │ - level          │  │ - cleanup timers │             │   │
│  │  └──────────────────┘  └──────────────────┘             │   │
│  │                                                            │   │
│  │  ┌──────────────────┐  ┌──────────────────┐             │   │
│  │  │ PlayerInventory  │  │ PlayerExperience │             │   │
│  │  ├──────────────────┤  ├──────────────────┤             │   │
│  │  │ - items: {}      │  │ - xp, level      │             │   │
│  │  │ - add/remove     │  │ - progression    │             │   │
│  │  │ - query items    │  │ - level thresholds│            │   │
│  │  └──────────────────┘  └──────────────────┘             │   │
│  │                                                            │   │
│  │  Public Methods:                                         │   │
│  │  - move(dx, dy)                                          │   │
│  │  - takeDamage(amount)                                   │   │
│  │  - gatherResource(type, qty)                            │   │
│  │  - addXP(amount)                                        │   │
│  │  - toClient() → serialized state                        │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓ (socket.io)
┌─────────────────────────────────────────────────────────────────────┐
│                         GAME CLIENT                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                   ClientPlayer                            │   │
│  │  - Local UI state only                                    │   │
│  │  - Syncs from server (no authority)                       │   │
│  │  - Handles rendering interpolation                        │   │
│  │  - Manages visual effects                                 │   │
│  │                                                            │   │
│  │  Properties:                                              │   │
│  │  - x, y (server position)                                 │   │
│  │  - renderX, renderY (interpolated for smooth motion)     │   │
│  │  - hp, hpMax, damage, level (display only)              │   │
│  │  - inventory {} (synced from server)                      │   │
│  │  - activeEffects [] (visual only)                         │   │
│  │                                                            │   │
│  │  Public Methods:                                          │   │
│  │  - syncFromServer(state) - Update all properties         │   │
│  │  - update() - Smooth interpolation                       │   │
│  │  - getInventorySummary(max) - Format for UI             │   │
│  │  - getXPProgress() - Get progress 0-1                   │   │
│  │  - setFacingDirection(dir)                              │   │
│  │  - addEffect(effect)                                     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Renderer    │  │ InputHandler │  │ StatusPanel  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│       ↓                   ↓                   ↓                    │
│    Draw player       Read input          Display stats             │
│    Draw resources    Send actions        Show inventory            │
│    Draw UI           Fire events         Show XP bar               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Player Movement
```
Client Input (InputHandler)
    ↓
Network emit 'playerInput'
    ↓
Server receives (index.js)
    ↓
ServerPlayer.move(dx, dy)
    ↓
Server broadcasts 'state'
    ↓
ClientPlayer.syncFromServer()
    ↓
ClientPlayer.update() - smooth interpolation
    ↓
Renderer draws at renderX, renderY
```

### Resource Gathering
```
Client Click (InputHandler)
    ↓
Network emit 'playerAction'
    ↓
Server hit detection (index.js)
    ↓
ServerPlayer.gatherResource(type)
    ↓
ServerPlayer.inventory.addResource()
    ↓
Server broadcasts 'state'
    ↓
ClientPlayer.syncFromServer()
    ↓
StatusPanel displays inventory
```

### Damage & Healing
```
Enemy hits Player (Server AI)
    ↓
ServerPlayer.takeDamage(amount)
    ↓
PlayerHealth.takeDamage()
    ↓
Stats updated, healing scheduled
    ↓
After REGEN_DELAY:
    ↓
PlayerHealth.startRegen()
    ↓
HP ticks up every HEAL_TICK
    ↓
Server broadcasts 'state'
    ↓
ClientPlayer.syncFromServer()
    ↓
Renderer draws HP bar
```

### Experience & Leveling
```
Enemy defeated (Server AI)
    ↓
ServerPlayer.addXP(amount)
    ↓
PlayerExperience.addXP()
    ↓
If threshold reached:
    ↓
PlayerExperience.levelUp()
    ↓
ServerPlayer.onLevelUp()
    ↓
PlayerStats.levelUp() - boost HP/damage
    ↓
Server broadcasts 'state'
    ↓
ClientPlayer.syncFromServer()
    ↓
StatusPanel shows new level & XP
```

## System Dependencies

```
ServerPlayer
├── PlayerStats (required)
│   └── No dependencies
├── PlayerHealth (required)
│   └── Uses PlayerStats
├── PlayerInventory (required)
│   └── No dependencies
└── PlayerExperience (required)
    └── No dependencies

ClientPlayer
└── No dependencies (standalone)
```

## Comparison: Old vs New

### Old Architecture (BEFORE)
```
Client Player        Server Player
├── id               ├── id
├── name             ├── name
├── x, y             ├── x, y
├── renderX, Y       ├── hp, hpMax
├── health           ├── damage, speed
├── maxHealth        ├── level, xp
├── inventory []     ├── inventory []
├── speed            ├── takeDamage()
└── update()         ├── startHealing()
                     ├── addXP()
                     ├── levelUp()
                     └── gatherResource()

PROBLEM: Duplicate logic, inconsistent naming
```

### New Architecture (AFTER)
```
ServerPlayer                ClientPlayer
├── id                      ├── id
├── name                    ├── name
├── x, y                    ├── x, y
├── stats                   ├── renderX, renderY
│   ├── hp, hpMax           ├── inventory {}
│   ├── damage              ├── activeEffects []
│   ├── speed               ├── level, hp, damage
│   └── level               ├── syncFromServer()
├── health                  └── update()
│   └── regen logic
├── inventory
│   └── item tracking
├── experience
│   └── xp & level logic
└── toClient()

BENEFIT: Clean separation, single responsibility
```


---

## 2026 Update: Resources, Collision Fidelity, and Expanded Enemy AI

### Resource & Collision Updates
- Added a dedicated `client/resource-editor.html` with dynamic type loading from `client/src/rendering/definitions/resourceVisualDefinitions.js`.
- Resource visuals are now centralized in `resourceVisualDefinitions` and consumed by drawer/editor code paths.
- Solid-resource visual offsets are blocked in rendering so client visuals align with server collision positions.
- Server collision now supports per-resource collision offsets (`collisionOffsetX/Y`), small radius reduction, and center-based entity collision checks.

### New/Updated Resources
- Added `gold` and `grain` resource types.
- Extended resource factory + biome rules to spawn these resources.
- Updated resource drawing to better represent each type silhouette (tree, ore, gem, cactus, flower, grain, etc.).

### Enemy AI Expansion
- Added new enemy types: `hyena` (agile sidestep predator) and `rabbit` (passive flee mob).
- Added enemy `FLEE` state and per-enemy AI stat overrides (hunt range, attack range, flee range, speeds, cooldown, damage).
- Wolf trait: speeds up against players at or below 50% HP.
- Bear trait: higher attack damage and larger detection range.
