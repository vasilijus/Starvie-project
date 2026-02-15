# 🎮 Game Architecture Documentation

## Quick Navigation

### For First-Time Setup
1. **START HERE**: [REFACTORING_COMPLETE.md](REFACTORING_COMPLETE.md) - Overview of changes
2. **Then READ**: [ARCHITECTURE.md](ARCHITECTURE.md) - Visual diagrams and data flow
3. **VERIFY**: Run [REFACTORING_CHECKLIST.js](REFACTORING_CHECKLIST.js) to check setup

### For Development
- **Need to understand the code structure?** → [ARCHITECTURE.md](ARCHITECTURE.md)
- **Migrating old code?** → [MIGRATION_GUIDE.js](MIGRATION_GUIDE.js)
- **Want detailed improvements?** → [REFACTORING_NOTES.md](REFACTORING_NOTES.md)
- **Adding new features?** → See "Architecture Patterns" below

### For Troubleshooting
- **Player not syncing?** → See ClientPlayer.syncFromServer()
- **Health not regenerating?** → Check PlayerHealth.takeDamage()
- **Inventory not updating?** → Verify toClient() includes inventory
- **Import errors?** → Check MIGRATION_GUIDE.js for correct imports

---

## Project Structure Overview

```
CanvasHtml/
├── 📁 server/
│   ├── index.js (Main server, uses ServerPlayer)
│   ├── 📁 modules/
│   │   ├── ServerPlayer.js (Main orchestrator)
│   │   ├── 📁 core/ (Modular systems)
│   │   │   ├── PlayerStats.js
│   │   │   ├── PlayerHealth.js
│   │   │   ├── PlayerInventory.js
│   │   │   └── PlayerExperience.js
│   │   ├── EnemyTypes.js
│   │   └── ... other modules
│   └── 📁 map/
│       └── BiomeRules.js (Resource distribution)
│
├── 📁 client/
│   ├── main.js (Main client, uses ClientPlayer)
│   ├── 📁 modules/
│   │   ├── ClientPlayer.js (Client-side player)
│   │   ├── Renderer.js
│   │   ├── InputHandler.js
│   │   ├── StatusPanel.js
│   │   └── ... other modules
│   └── index.html
│
├── 📄 ARCHITECTURE.md (Read this first!)
├── 📄 REFACTORING_NOTES.md
├── 📄 REFACTORING_COMPLETE.md
├── 📄 MIGRATION_GUIDE.js
├── 📄 REFACTORING_CHECKLIST.js
└── 📄 README_ARCHITECTURE.md (This file)
```

---

## Core Systems Architecture

### ServerPlayer (Server-Side Orchestrator)
```javascript
class ServerPlayer {
  // Core systems (composed)
  stats: PlayerStats        // HP, damage, speed, level
  health: PlayerHealth      // Regeneration, damage timing
  inventory: PlayerInventory // Resource tracking
  experience: PlayerExperience // XP and progression
  
  // Public API
  move(dx, dy)
  takeDamage(amount)
  gatherResource(type, qty)
  addXP(amount)
  toClient() // Serialize for network
}
```

### ClientPlayer (Client-Side Display)
```javascript
class ClientPlayer {
  // Server-synced properties
  x, y              // Actual position
  renderX, renderY  // Smoothed for display
  hp, hpMax         // Display values
  inventory {}      // Synced items
  
  // Public API
  syncFromServer(state)  // Sync all properties
  update()               // Smooth interpolation
  getInventorySummary()  // Format for UI
  getXPProgress()        // Progress bar value
}
```

---

## Adding New Features

### Pattern 1: Add a new stat system

Example: Add a stamina/mana system

```javascript
// 1. Create new module: server/modules/core/PlayerStamina.js
export class PlayerStamina {
  constructor() {
    this.stamina = 100;
    this.staminaMax = 100;
  }
  useStamina(amount) { ... }
  restoreStamina(amount) { ... }
}

// 2. Add to ServerPlayer
import { PlayerStamina } from './core/PlayerStamina.js';

class ServerPlayer {
  constructor(...) {
    this.stamina = new PlayerStamina(); // Add here
  }
  
  // Add public method
  useStamina(amount) {
    return this.stamina.useStamina(amount);
  }
}

// 3. Sync to client in toClient()
toClient() {
  return {
    // ... existing properties
    stamina: this.stamina.stamina,
    staminaMax: this.stamina.staminaMax
  };
}

// 4. Display on ClientPlayer
class ClientPlayer {
  stamina = 100;
  staminaMax = 100;
  
  // In StatusPanel.js, add stamina bar
}
```

### Pattern 2: Add new feature to existing system

Example: Add equipment bonuses to stats

```javascript
// 1. Create equipment module: server/modules/core/PlayerEquipment.js
export class PlayerEquipment {
  constructor() {
    this.equipped = {};
  }
  equip(slot, item) { ... }
  getStatBonus(stat) { ... }
}

// 2. Add to ServerPlayer
class ServerPlayer {
  constructor(...) {
    this.equipment = new PlayerEquipment();
  }
}

// 3. Modify stat calculations
class PlayerStats {
  getDamage(equipment) {
    return this.damage + equipment.getStatBonus('damage');
  }
}

// 4. Use in game logic
const totalDamage = player.stats.getDamage(player.equipment);
```

### Pattern 3: Add new gathering system

Example: Add fishing system

```javascript
// 1. Create new gathering system
export class PlayerFishing {
  castLine(location) { ... }
  catchFish(type) { ... }
}

// 2. Add to ServerPlayer
class ServerPlayer {
  fishing = new PlayerFishing();
  
  startFishing() {
    return this.fishing.castLine(this.x, this.y);
  }
}

// 3. Call from game logic
if (player.fishing.isActive) {
  const fish = player.fishing.update();
  if (fish) {
    player.gatherResource('fish', fish.count);
  }
}
```

---

## Communication Flow

### State Broadcast
```
Server Loop (30 FPS)
  ↓
for each player:
  player.toClient() → serialized state
  ↓
io.emit('state', { players, enemies, resources, ... })
  ↓
Client receives 'state'
  ↓
player.syncFromServer(serverState)
  ↓
renderer.render(data)
```

### Player Action
```
Client: User clicks (InputHandler)
  ↓
network.emit('playerAction', {type, direction, item})
  ↓
Server: socket.on('playerAction', (data) => {
  const hit = calculateHit(player, data.direction)
  if (hitResource) player.gatherResource(...)
  if (hitEnemy) player.takeDamage(...)
})
  ↓
Next state broadcast updates client
```

---

## Testing Guide

### Unit Test Example: PlayerStats
```javascript
import { PlayerStats } from './server/modules/core/PlayerStats.js';

test('takeDamage reduces HP', () => {
  const stats = new PlayerStats();
  stats.takeDamage(10);
  expect(stats.hp).toBe(90);
});

test('levelUp increases damage', () => {
  const stats = new PlayerStats();
  const oldDamage = stats.damage;
  stats.levelUp();
  expect(stats.damage).toBeGreaterThan(oldDamage);
});
```

### Integration Test Example: ServerPlayer
```javascript
test('gatherResource updates inventory', () => {
  const player = new ServerPlayer('id', 'name', 0, 0);
  player.gatherResource('wood', 5);
  const state = player.toClient();
  expect(state.inventory.wood).toBe(5);
});
```

---

## Performance Considerations

### Before (Old Architecture)
- Two Player classes with overlapping logic
- Harder to optimize (changes needed in multiple places)
- More memory usage (duplicated systems)

### After (New Architecture)
- Single source of truth per system
- Easy to optimize individual components
- Better memory efficiency (no duplication)
- Cleaner data flow = faster serialization

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "inventory is not an object" | Using old `Player.inventory[]` | Use `ClientPlayer.inventory {}` |
| "hp is undefined" | Accessing wrong property | Use `player.hp` on client, `player.stats.hp` on server |
| "takeDamage not working" | Not using ServerPlayer | Ensure using `ServerPlayer` not old `Player` |
| "Experience not syncing" | Missing from `toClient()` | Add `xp`, `level`, `xpToNextLevel` to returned object |
| "Health not regenerating" | Manual healing code | Let `PlayerHealth.takeDamage()` handle it automatically |

---

## Best Practices

✅ **DO:**
- Use `ServerPlayer` methods instead of modifying systems directly
- Call `syncFromServer()` on client after state update
- Keep client-side code client-only, server-side code server-only
- Add new systems as separate modules in `server/modules/core/`
- Use `toClient()` for serialization, never expose internals

❌ **DON'T:**
- Mix server and client logic
- Directly modify `player.stats.hp` (use `takeDamage()` instead)
- Access `player.health` on client (sync through server)
- Store complex objects in toClient() (serialize primitives only)
- Create dependencies between core systems (compose instead)

---

## Roadmap

### Phase 1: Refactoring (✅ DONE)
- Split monolithic Player classes
- Create modular systems
- Establish clear APIs

### Phase 2: Features (NEXT)
- Equipment system
- Crafting system
- Abilities/spells
- Status effects

### Phase 3: Polish (FUTURE)
- Animation system
- Sound system
- Particle effects
- UI improvements

### Phase 4: Scale (LATER)
- Database persistence
- Server load balancing
- Matchmaking system
- Guilds/clans

---

## Questions?

Refer to:
- 📖 [ARCHITECTURE.md](ARCHITECTURE.md) - Diagrams
- 📖 [REFACTORING_NOTES.md](REFACTORING_NOTES.md) - Details
- 📖 [MIGRATION_GUIDE.js](MIGRATION_GUIDE.js) - Examples

Or review the source code - it's well-commented!

---

**Last Updated:** February 2026
**Status:** ✅ Complete and tested


---

## 🔄 Recent Gameplay/Systems Updates

### Resources
- Added `gold` and `grain` resources across factory/world generation.
- Added a dynamic **Resource Visual Editor** (`/resource-editor.html`) that reads resource types from JS definitions.
- Moved resource visual metadata into `client/src/rendering/definitions/resourceVisualDefinitions.js` for a single source of truth.

### Collision
- Solid resources are rendered at true world coordinates (no visual spreading offsets).
- Server collision now supports collision center offsets (`collisionOffsetX`, `collisionOffsetY`) and reduced effective radius for tighter feel.
- Player/resource collision checks now use corrected center-based math for better left/right consistency.

### Enemies
- New enemy types: **hyena** and **rabbit**.
- New AI state: **FLEE** for passive mobs.
- Wolf gets low-player-health chase boost.
- Bear has stronger hit + larger perception range.
