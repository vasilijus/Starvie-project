let EDIT_MODE = false;
let selectedBiome = "plains";

const BIOME_COLORS = {
  plains: "#88c070",
  forest: "#3f7a2c",
  desert: "#d9c27a",
  snow: "#e8f2ff"
};
export default class InputHandler {
  constructor(canvas, player, network, mapEditor = null) {
    this.canvas = canvas;
    this.player = player;
    this.network = network;
    this.mapEditor = mapEditor;
    this.keys = {};
    this.lastGameState = null;  // ← ADD THIS LINE
    window.addEventListener('keydown', e => this.keys[e.key] = true);
    window.addEventListener('keyup', e => this.keys[e.key] = false);
    window.addEventListener('click', e => this.handleClick(e));
    window.addEventListener('mousemove', e => this.handleMouseMove(e));
    this.startSendLoop();

    // Store last state for resource detection
    this.lastState = null;
  }

  handleMouseMove(e) {
    // In editor mode, don't update facing direction
    if (this.mapEditor && this.mapEditor.isActive) return;

    // Convert screen position to world position (same as click handler)
    const mouseWorldX = this.player.x - this.canvas.width / 2 + e.clientX;
    const mouseWorldY = this.player.y - this.canvas.height / 2 + e.clientY;

    // Calculate direction from player to mouse in world space
    const dx = mouseWorldX - this.player.x;
    const dy = mouseWorldY - this.player.y;
    const len = Math.hypot(dx, dy);
    
    if (len > 0) {
      const norm = { x: dx / len, y: dy / len };
      this.player.facingDirection = norm;
      // Send to server so all players see the updated direction
      this.network.emit('playerFacingDirection', norm);
      // console.log(`[MouseMove] Player: (${this.player.x}, ${this.player.y}), Mouse world: (${mouseWorldX}, ${mouseWorldY}), Direction: (${norm.x.toFixed(2)}, ${norm.y.toFixed(2)})`);
    }
  }

  startSendLoop() {
    const send = () => {
      // Editor mode toggle
      if (this.keys['m']) {
        if (!this.mPressed) {
          if (this.mapEditor) {
            this.mapEditor.toggle();
          }
          this.mPressed = true;
        }
      } else {
        this.mPressed = false;
      }

      // In editor mode, don't send movement input
      if (this.mapEditor && this.mapEditor.isActive) {
        requestAnimationFrame(send);
        return;
      }

      const dir = { x: 0, y: 0 };
      if (this.keys['w']) dir.y -= 1;
      if (this.keys['s']) dir.y += 1;
      if (this.keys['a']) dir.x -= 1;
      if (this.keys['d']) dir.x += 1;

      this.network.emit('playerInput', dir);
      requestAnimationFrame(send);
    };
    send();
  }

  handleClick(e) {
    // console.log('mouseevent')
    // 1. Keep Editor mode unthrottled for better UX
    if (this.mapEditor && this.mapEditor.isActive) {
        const { worldX, worldY } = this.mapEditor.screenToWorld(e.clientX, e.clientY, this.player);
        this.mapEditor.paintChunk(worldX, worldY);
        return;
    }

    // 2. Determine if this is an attack
    // Treat left-click as an attack for immediate feedback and gameplay
    // (click event uses button==0 for left click)
    const isLeftClick = e && typeof e.button === 'number' && e.button === 0;
    const equipment = this.player.equipment || 'none';
    const isMeleeEquipped = (equipment === 'sword' || equipment === 'axe');
    const type = (isMeleeEquipped || isLeftClick) ? 'attack' : 'interact';

    // 3. Apply Throttle Logic
    if (type === 'attack') {
        const now = Date.now();
        // Calculate delay in ms (e.g., 2 speed = 500ms delay)
        const attackDelay = 2000 / this.player.attackSpeed; 

        if (now - this.player.lastAttackTime < attackDelay) {
            console.log('Attack on cooldown...');
            return; // Exit function; click is ignored
        }

        // Update the timestamp only on a successful attack
        this.player.lastAttackTime = now;
    }

    // 4. Existing Logic (Positioning & Emitting)
    const clickX = this.player.x - this.canvas.width / 2 + e.clientX;
    const clickY = this.player.y - this.canvas.height / 2 + e.clientY;
    const dx = clickX - this.player.x;
    const dy = clickY - this.player.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const norm = { x: dx / len, y: dy / len };
    this.player.facingDirection = norm;

    // If this is an attack, start local attack animation for immediate feedback
    if (type === 'attack') {
      try { 
        // console.log('[InputHandler] attack click -> start local animation');
        this.player.startAttack(norm);
      } catch(err) {
        // defensive: if player doesn't have startAttack, ignore
      }
    }

    // Try to detect if clicking on a resource or enemy drop
    let targetResourceId = null;

    // Check distance to resources in the state (if available)
    if (this.lastState && this.lastState.resources) {
        for (const resource of this.lastState.resources) {
            const dist = Math.hypot(clickX - resource.x, clickY - resource.y);
            if (dist < 30) { // Click range
                targetResourceId = resource.id;
                this.network.emit('harvestResource', resourceId);
                return;
            }
        }
    }

    // DEBUG: Log what we found
    console.log(`[INPUT] Clicked at world: (${clickX}, ${clickY})`);
    console.log(`[INPUT] Direction: (${norm.x.toFixed(2)}, ${norm.y.toFixed(2)})`);
    if (this.lastGameState && this.lastGameState.resources) {
      console.log(`[INPUT] Available resources: ${this.lastGameState.resources.length}`);
      for (const res of this.lastGameState.resources) {
        const dist = Math.hypot(clickX - res.x, clickY - res.y);
        console.log(`[INPUT]   Resource ${res.type} at (${res.x}, ${res.y}), distance: ${dist.toFixed(0)}`);
        if (dist < 40) {
          console.log(`[INPUT] CLICK HIT RESOURCE! Sending harvestResource event for ID: ${res.id}`);
          this.network.emit('harvestResource', res.id);
          return;
        }
      }
    }

    this.network.emit('playerAction', { type, direction: norm, item: equipment, targetResourceId });

  }
}