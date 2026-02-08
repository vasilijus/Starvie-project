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

        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup', e => this.keys[e.key] = false);
        window.addEventListener('click', e => this.handleClick(e));
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
            this.network.emit('playerFacingDirection', norm);
        }
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
                requestAnimationFrame(send);
                return;
            }

            const dir = { x: 0, y: 0 };
            if (this.keys['w']) dir.y -= 1;
            if (this.keys['s']) dir.y += 1;
            if (this.keys['a']) dir.x -= 1;
            if (this.keys['d']) dir.x += 1;

            // hotbar quick-select
            if (this.keys['1']) this.player.selectHotbar(0);
            if (this.keys['2']) this.player.selectHotbar(1);
            if (this.keys['3']) this.player.selectHotbar(2);
            if (this.keys['4']) this.player.selectHotbar(3);
            if (this.keys['5']) this.player.selectHotbar(4);

            this.network.emit('playerInput', dir);
            requestAnimationFrame(send);
        };
        send();
    }

    handleClick(e) {
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
        const equipment = this.player.equipment || 'none';
        const isMeleeEquipped = (equipment === 'sword' || equipment === 'axe');
        const type = (isMeleeEquipped || isLeftClick) ? 'attack' : 'interact';

        if (type === 'attack') {
            const now = Date.now();
            const attackDelay = 2000 / this.player.attackSpeed;
            if (now - this.player.lastAttackTime < attackDelay) {
                // on cooldown
                return;
            }
            this.player.lastAttackTime = now;
        }

        const clickX = this.player.x - this.canvas.width / 2 + e.clientX;
        const clickY = this.player.y - this.canvas.height / 2 + e.clientY;
        const dx = clickX - this.player.x;
        const dy = clickY - this.player.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) return;

        const norm = { x: dx / len, y: dy / len };
        this.player.facingDirection = norm;

        if (type === 'attack') {
            try { this.player.startAttack(norm); } catch (err) { }
        }

        // Try to detect clicking on resources or drops using the last server state
        const state = this.lastState || {};
        const maxClickRange = 40;

        if (state.resources && Array.isArray(state.resources)) {
            for (const resource of state.resources) {
                const dist = Math.hypot(clickX - resource.x, clickY - resource.y);
                if (dist < maxClickRange) {
                    // Hit an environment resource
                    this.network.emit('harvestResource', resource.id);
                    return; // don't send playerAction
                }
            }
        }

        if (state.enemyDrops && Array.isArray(state.enemyDrops)) {
            for (const drop of state.enemyDrops) {
                const dist = Math.hypot(clickX - drop.x, clickY - drop.y);
                if (dist < maxClickRange) {
                    // Hit an enemy drop
                    this.network.emit('harvestResource', drop.id);
                    return;
                }
            }
        }

        // fallback: send a generic playerAction
        this.network.emit('playerAction', { type, direction: norm, item: equipment, targetResourceId: null });
    }
}