/**
 * ClientPlayer - Client-side player that syncs from server
 * Handles only rendering and local state (smooth interpolation, UI)
 */
export class ClientPlayer {
    constructor(id, name) {
        this.id = id;
        this.name = name;

        // Server-authoritative position
        this.x = 0;
        this.y = 0;

        // Display stats (synced from server)
        this.hp = 100;
        this.hpMax = 100;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.damage = 10;
        this.size = 20;

        // Inventory (synced from server)
        this.inventory = {};

        // Hotbar / quickslots (client-local)
        this.hotbarSize = 5;
        this.hotbar = new Array(this.hotbarSize).fill(null); // each slot: { type: 'axe' } or null
        this.selectedHotbarIndex = 0;
        this.equipment = null; // currently equipped item type (string) or null

        // Local UI state
        this.isAlive = true;
        this.facingDirection = { x: 0, y: -1 };
        this.activeEffects = [];

        // Attack / action visual state (client-side)
        this.isAttacking = false;
        this.attackStart = 0;
        this.attackDuration = 300; // ms
        this.attackProgress = 0; // 0..1
        this.attackDirection = { x: 0, y: -1 };

        this.attackSpeed = 2; // 2 attacks per second
        this.lastAttackTime = 0;
    }

    /**
     * Update from server state
     */
    syncFromServer(serverState) {
        this.x = serverState.x;
        this.y = serverState.y;
        this.hp = serverState.hp;
        this.hpMax = serverState.hpMax;
        this.damage = serverState.damage;
        this.level = serverState.level;
        this.xp = serverState.xp;
        this.xpToNextLevel = serverState.xpToNextLevel;
        this.inventory = serverState.inventory || {};
        this.isAlive = serverState.isAlive;
        if (serverState.facingDirection) {
            this.facingDirection = serverState.facingDirection;
        }
    }

    /**
     * Update (no-op now that we use direct x/y)
     */
    update() {
        // Update attack animation progress
        if (this.isAttacking) {
            const now = Date.now();
            const t = (now - this.attackStart) / Math.max(1, this.attackDuration);
            if (t >= 1) {
                this.isAttacking = false;
                this.attackProgress = 0;
            } else {
                this.attackProgress = t;
            }
        }
    }

    /**
     * Start a local attack animation (visual only)
     * direction: {x,y}
     */
    startAttack(direction, duration = 300) {
        this.isAttacking = true;
        this.attackStart = Date.now();
        this.attackDuration = duration;
        this.attackProgress = 0;
        this.attackDirection = direction || { x: 0, y: -1 };
        // console.log(`[ClientPlayer] startAttack: dir=(${this.attackDirection.x.toFixed(2)}, ${this.attackDirection.y.toFixed(2)}), duration=${this.attackDuration}`);
    }


    // Select a hotbar slot (index 0..hotbarSize-1)
    selectHotbar(index) {
        if (index < 0 || index >= this.hotbarSize) return;
        this.selectedHotbarIndex = index;
        const slot = this.hotbar[index];
        this.equipment = slot ? slot.type : null;
        // console.log(`[ClientPlayer] hotbar select ${index} -> ${this.equipment}`);
    }

    // Set a hotbar slot explicitly (type is string, e.g. 'axe')
    setHotbarSlot(index, type) {
        if (index < 0 || index >= this.hotbarSize) return;
        this.hotbar[index] = type ? { type } : null;
        // if setting current selected slot, update equipment
        if (this.selectedHotbarIndex === index) this.equipment = type || null;
    }

    // Get currently selected item type
    getSelectedItem() {
        return this.equipment;
    }


    /**
     * Set player facing direction
     */
    setFacingDirection(direction) {
        this.facingDirection = direction;
    }

    /**
     * Add visual effect (hit, gather, etc.)
     */
    addEffect(effect) {
        this.activeEffects.push(effect);
    }

    /**
     * Remove effect by index
     */
    removeEffect(index) {
        this.activeEffects.splice(index, 1);
    }

    /**
     * Get inventory display info
     */
    getInventorySummary(maxItems = 3) {
        const items = Object.entries(this.inventory)
            .slice(0, maxItems)
            .map(([type, qty]) => ({ type, qty }));

        return {
            items,
            totalItems: Object.values(this.inventory).reduce((sum, qty) => sum + qty, 0),
            isEmpty: items.length === 0
        };
    }

    /**
     * Get XP progress (0-1)
     */
    getXPProgress() {
        return Math.min(1, this.xp / Math.max(1, this.xpToNextLevel));
    }
}
