// ...existing code...
let EDIT_MODE = false;
let selectedBiome = "plains";

const BIOME_COLORS = {
    plains: "#88c070",
    forest: "#3f7a2c",
    desert: "#d9c27a",
    snow: "#e8f2ff"
};
export default class InputHandler {
    constructor(canvas, player, network, mapEditor = null, craftingPanel = null) {
        this.canvas = canvas;
        this.player = player;
        this.network = network;
        this.mapEditor = mapEditor;
        this.craftingPanel = craftingPanel;
        this.keys = {};
        this.lastState = null;
        this.lastSentMove = null;
        this.lastSentFacing = null;
        this.lastFacingSentAt = 0;
        this.facingSendIntervalMs = 50;

        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup', e => this.keys[e.key] = false);
        // Use mousedown so left/right actions are distinguishable.
        // `click` always reports primary button, which made interact logic unreachable.
        window.addEventListener('mousedown', e => this.handlePointerAction(e));
        window.addEventListener('contextmenu', e => e.preventDefault());
        window.addEventListener('mousemove', e => this.handleMouseMove(e));

        this.startSendLoop();
    }

    handleMouseMove(e) {
        if (this.mapEditor && this.mapEditor.isActive) return;

        const mouseWorldX = this.player.x - this.canvas.width / 2 + e.clientX;
        const mouseWorldY = this.player.y - this.canvas.height / 2 + e.clientY;

        const dx = mouseWorldX - this.player.x;
        const dy = mouseWorldY - this.player.y;
        const len = Math.hypot(dx, dy);

        if (len > 0) {
            const norm = { x: dx / len, y: dy / len };
            this.player.facingDirection = norm;
            this.maybeEmitFacing(norm);
        }
    }

    maybeEmitFacing(direction) {
        const now = Date.now();
        if (now - this.lastFacingSentAt < this.facingSendIntervalMs) return;

        const prev = this.lastSentFacing;
        if (prev && Math.abs(prev.x - direction.x) < 0.01 && Math.abs(prev.y - direction.y) < 0.01) return;

        this.network.emit('playerFacingDirection', direction);
        this.lastSentFacing = direction;
        this.lastFacingSentAt = now;
    }

    maybeEmitMovement(dir) {
        const prev = this.lastSentMove;
        if (prev && prev.x === dir.x && prev.y === dir.y) return;

        this.network.emit('playerInput', dir);
        this.lastSentMove = { ...dir };
    }

    startSendLoop() {
        const send = () => {
            if (this.keys['m']) {
                if (!this.mPressed) {
                    if (this.mapEditor) this.mapEditor.toggle();
                    this.mPressed = true;
                }
            } else {
                this.mPressed = false;
            }

            if (this.keys['t'] || this.keys['T']) {
                if (!this.tPressed) {
                    if (this.mapEditor && this.mapEditor.isActive) {
                        this.mapEditor.paintMode = this.mapEditor.paintMode === 'chunk' ? 'tile' : 'chunk';
                        const paintModeLabel = document.getElementById('paintModeLabel');
                        if (paintModeLabel) {
                            paintModeLabel.textContent = this.mapEditor.paintMode === 'chunk' ? 'Chunk' : 'Tile';
                        }
                    }
                    this.tPressed = true;
                }
            } else {
                this.tPressed = false;
            }

            // Toggle crafting panel with 'C'
            if (this.keys['c'] || this.keys['C']) {
                if (!this.cPressed) {
                    console.log('C pressed, craftingPanel:', this.craftingPanel);
                    console.log('craftingPanel.isOpen before toggle:', this.craftingPanel?.isOpen);
                    if (this.craftingPanel) {
                        this.craftingPanel.toggle();
                        console.log('craftingPanel.isOpen after toggle:', this.craftingPanel.isOpen);
                    } else {
                        console.warn('craftingPanel is null!');
                    }
                    this.cPressed = true;
                }
            } else {
                this.cPressed = false;
            }

            if (this.mapEditor && this.mapEditor.isActive) {
                this.maybeEmitMovement({ x: 0, y: 0 });
                requestAnimationFrame(send);
                return;
            }

            const dir = { x: 0, y: 0 };
            if (this.keys['w']) dir.y -= 1 * this.player.speed;
            if (this.keys['s']) dir.y += 1 * this.player.speed;
            if (this.keys['a']) dir.x -= 1 * this.player.speed;
            if (this.keys['d']) dir.x += 1 * this.player.speed;

            // hotbar quick-select
            if (this.keys['1']) this.player.selectHotbar(0);
            if (this.keys['2']) this.player.selectHotbar(1);
            if (this.keys['3']) this.player.selectHotbar(2);
            if (this.keys['4']) this.player.selectHotbar(3);
            if (this.keys['5']) this.player.selectHotbar(4);

            this.maybeEmitMovement(dir);
            requestAnimationFrame(send);
        };
        send();
    }

    getWorldClick(e) {
        return {
            x: this.player.x - this.canvas.width / 2 + e.clientX,
            y: this.player.y - this.canvas.height / 2 + e.clientY
        };
    }

    findClosestTarget(items, clickX, clickY, maxClickRange) {
        if (!Array.isArray(items) || items.length === 0) return null;

        let closest = null;
        let closestDist = maxClickRange;

        for (const item of items) {
            const dist = Math.hypot(clickX - item.x, clickY - item.y);
            if (dist < closestDist) {
                closest = item;
                closestDist = dist;
            }
        }

        return closest;
    }

    resolveClickTarget(clickX, clickY) {
        const state = this.lastState || {};
        const maxClickRange = 40;

        // OSRS style priority: loot on ground > skilling resource > mob
        const dropTarget = this.findClosestTarget(state.enemyDrops, clickX, clickY, maxClickRange);
        if (dropTarget) return { kind: 'drop', entity: dropTarget };

        const resourceTarget = this.findClosestTarget(state.resources, clickX, clickY, maxClickRange);
        if (resourceTarget) return { kind: 'resource', entity: resourceTarget };

        const enemyTarget = this.findClosestTarget(state.enemies, clickX, clickY, maxClickRange);
        if (enemyTarget) return { kind: 'enemy', entity: enemyTarget };

        return null;
    }

    canAttack() {
        const now = Date.now();
        const attackDelay = 2000 / this.player.attackSpeed;
        if (now - this.player.lastAttackTime < attackDelay) return false;

        this.player.lastAttackTime = now;
        return true;
    }

    handlePointerAction(e) {
        // Check for craft button clicks first (if panel is open)
        if (this.craftingPanel && this.craftingPanel.isOpen) {
            console.log('Crafting panel is open, checking for clicks...');
            const craftingRules = this.craftingPanel.craftingRules;
            if (craftingRules && craftingRules.recipes) {
                for (let i = 0; i < craftingRules.recipes.length; i++) {
                    const area = this.craftingPanel.getClickableArea(i);
                    if (area) {
                        const rect = this.canvas.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const clickY = e.clientY - rect.top;
                        console.log(`Recipe ${i} clickable area:`, area, `Click coords:`, clickX, clickY);

                        if (clickX >= area.x && clickX < area.x + area.w &&
                            clickY >= area.y && clickY < area.y + area.h) {
                            console.log(`Clicked craft button for recipe ${i}`);
                            this.craftingPanel.queueCraft(this.player, i);
                            return;
                        }
                    }
                }
            }
        }

        if (this.mapEditor && this.mapEditor.isActive) {
            const { worldX, worldY } = this.mapEditor.screenToWorld(e.clientX, e.clientY, this.player);
            this.mapEditor.paintChunk(worldX, worldY);
            return;
        }

        const isLeftClick = e && typeof e.button === 'number' && e.button === 0;
        const isRightClick = e && typeof e.button === 'number' && e.button === 2;

        if (!isLeftClick && !isRightClick) return;

        const equipment = this.player.equipment || 'none';
        const { x: clickX, y: clickY } = this.getWorldClick(e);
        const dx = clickX - this.player.x;
        const dy = clickY - this.player.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) return;

        const norm = { x: dx / len, y: dy / len };
        this.player.facingDirection = norm;

        const target = this.resolveClickTarget(clickX, clickY);

        if (target?.kind === 'drop' || target?.kind === 'resource') {
            this.network.emit('harvestResource', target.entity.id);
            return;
        }

        // Right-click forces interaction; left-click follows context-sensitive default.
        const shouldAttack = (target?.kind === 'enemy') || (isLeftClick && !target);

        if (shouldAttack) {
            console.log('InputHandler')
            console.log(this.player)
            if (!this.canAttack()) return;
            this.player.startAttack(norm);
            this.network.emit('playerAction', { type: 'attack', direction: norm, item: equipment, targetResourceId: null });
            return;
        }

        if (isRightClick) {
            this.network.emit('playerAction', { type: 'interact', direction: norm, item: equipment, targetResourceId: null });
            return;
        }

        // Safe fallback: keep server-side direction-based interactions alive.
        this.network.emit('playerAction', { type: 'interact', direction: norm, item: equipment, targetResourceId: null });
    }
}
