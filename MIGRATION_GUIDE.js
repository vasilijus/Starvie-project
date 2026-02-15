/**
 * MIGRATION GUIDE: Player Class Refactoring
 * 
 * This file documents all changes needed when transitioning to the new modular architecture.
 */

// ============================================================================
// SERVER SIDE CHANGES
// ============================================================================

// OLD CODE (server/index.js):
// import { Player } from './modules/Player.js';
// const player = new Player(id, x, y);

// NEW CODE (server/index.js):
import { ServerPlayer } from './modules/ServerPlayer.js';
const player = new ServerPlayer(id, name, x, y);

// ============================================================================
// CLIENT SIDE CHANGES
// ============================================================================

// OLD CODE (client/main.js):
// import { Player } from './modules/Player.js';
// const player = new Player(id, name);
// player.x = state.x;
// player.y = state.y;
// player.hp = state.hp;

// NEW CODE (client/main.js):
import { ClientPlayer } from './modules/ClientPlayer.js';
const player = new ClientPlayer(id, name);
player.syncFromServer(state); // Syncs all properties at once

// ============================================================================
// PROPERTY ACCESS CHANGES
// ============================================================================

// Server-side: Access stats through the stats object OR directly on player
old: player.hp                    // Still works (public property)
new: player.stats.hp              // Full access to stats system
new: player.hp                     // Shortcut via toClient() property (for display)

old: player.hpMax
new: player.stats.hpMax

old: player.damage
new: player.stats.damage

old: player.speed
new: player.stats.speed

old: player.level                 // Was directly on player
new: player.experience.level      // Now in experience system
new: player.stats.level           // Also available here

old: player.xp
new: player.experience.xp

old: player.inventory
new: player.inventory.toObject()  // Still an object, but wrapped

// ============================================================================
// METHOD CHANGES
// ============================================================================

// Health methods
old: player.takeDamage(10)
new: player.takeDamage(10)        // API unchanged! Uses internal health system

old: player.startHealing()
new: // Internal - called automatically after takeDamage delay

// Inventory methods
old: player.gatherResource(type)
new: player.gatherResource(type, quantity)  // Now supports quantity!

old: player.inventory.push(item)
new: player.inventory.addResource(type)

// Experience methods
old: player.addXP(100)
new: player.addXP(100)            // API unchanged! But now uses experience system

old: player.levelUp()
new: // Internal - called automatically when XP threshold reached

// State serialization
old: player.toClient() → {hp, damage, level, xp, ...}
new: player.toClient() → {hp, damage, level, xp, xpToNextLevel, inventory, ...}

// ============================================================================
// NEW METHODS & FEATURES
// ============================================================================

// Server-side only:
player.stats.heal(amount)                    // Direct health gain
player.inventory.removeResource(type, qty)   // Remove from inventory
player.inventory.getQuantity(type)           // Check inventory count
player.experience.getProgress()              // Get XP bar progress (0-1)
player.health.cleanup()                      // Clean up timers on disconnect

// Client-side only:
player.syncFromServer(serverState)           // Sync all properties from server
player.getInventorySummary(maxItems)         // Get formatted inventory for UI
player.getXPProgress()                       // Get XP bar progress (0-1)
player.setFacingDirection(direction)         // Set facing direction
player.addEffect(effect)                     // Add visual effect

// ============================================================================
// CLEANUP: OLD FILES TO REMOVE
// ============================================================================

// These can be deleted after migration is complete:
// - client/modules/Player.js              (Replaced by ClientPlayer.js)
// - server/modules/Player.js              (Replaced by ServerPlayer.js)
//   BUT KEEP AS BACKUP UNTIL TESTING IS COMPLETE

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

// ☐ Server starts without errors
// ☐ Client connects and receives initial state
// ☐ Player movement works
// ☐ Player takes damage and regenerates
// ☐ Resource gathering works
// ☐ XP gain and leveling works
// ☐ Inventory displays correctly on client
// ☐ Health bar displays correctly
// ☐ XP bar displays correctly
// ☐ Multiple players can interact
// ☐ Disconnect/reconnect works
// ☐ No console errors

// ============================================================================
// COMMON ISSUES & SOLUTIONS
// ============================================================================

// Issue: "player.hp is undefined"
// Solution: Make sure ServerPlayer properties are accessed correctly
// - player.stats.hp for internal stat
// - player.hp for toClient() display value
// - Check that toClient() is called before sending to client

// Issue: "player.inventory is an object, not an array"
// Solution: Update any code that expects array methods
// - OLD: player.inventory.push(item)
// - NEW: player.inventory.addResource(type)
// - Or just access: player.inventory.items object directly

// Issue: "Inventory not syncing to client"
// Solution: Ensure toClient() is called and includes inventory
// - Check ServerPlayer.toClient() includes inventory
// - Check ClientPlayer.syncFromServer() processes inventory

// Issue: "Health not regenerating"
// Solution: PlayerHealth system is inside ServerPlayer
// - No manual healing logic needed
// - takeDamage() automatically schedules regen
// - Use player.heal(amount) for manual healing


// ============================================================================
// 2026 SYSTEM UPDATES (POST-REFACTOR)
// ============================================================================
// RESOURCES
// - Added `gold` and `grain` resource types.
// - Resource visuals now come from `client/src/rendering/definitions/resourceVisualDefinitions.js`.
// - New tool page: `client/resource-editor.html` (dynamic type loading).
//
// COLLISION
// - Solid resources are drawn at world-true positions (no visual spread offset).
// - Server collision supports per-resource collision offsets and center-based checks.
//
// ENEMIES
// - Added `Hyena` and `Rabbit` classes in `server/src/entities/enemy/EnemyTypes.js`.
// - Enemy AI now supports `FLEE` state and per-enemy trait overrides.
// - Wolf and bear traits were adjusted for more distinct combat behavior.
