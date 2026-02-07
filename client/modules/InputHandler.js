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
    window.addEventListener('keydown', e => this.keys[e.key] = true);
    window.addEventListener('keyup', e => this.keys[e.key] = false);
    window.addEventListener('click', e => this.handleClick(e));
    window.addEventListener('mousemove', e => this.handleMouseMove(e));
    this.startSendLoop();
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
    console.log('mouseevent')
    // In editor mode, paint chunks
    if (this.mapEditor && this.mapEditor.isActive) {
      const { worldX, worldY } = this.mapEditor.screenToWorld(e.clientX, e.clientY, this.player);
      this.mapEditor.paintChunk(worldX, worldY);
      return;
    }

    // Normal gameplay click
    const clickX = this.player.x - this.canvas.width / 2 + e.clientX;
    const clickY = this.player.y - this.canvas.height / 2 + e.clientY;

    const dx = clickX - this.player.x;
    const dy = clickY - this.player.y;

    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const norm = { x: dx / len, y: dy / len };

    // Store the facing direction in player
    this.player.facingDirection = norm;
    const equipment = this.player.equipment || 'none';
    let type = (equipment === 'sword' || equipment === 'axe') ? 'attack' : 'interact';

    // Treat left-click as an attack for immediate feedback and gameplay
    // (click event uses button==0 for left click)
    try {
      if (e && typeof e.button === 'number' && e.button === 0) {
        type = 'attack';
      }
    } catch (err) {
      // ignore if event doesn't have button
    }

    // If this is an attack, start local attack animation for immediate feedback
    if (type === 'attack') {
      try {
        console.log('[InputHandler] attack click -> start local animation');
        this.player.startAttack(norm);
      } catch (err) {
        // defensive: if player doesn't have startAttack, ignore
      }
    }

    this.network.emit('playerAction', { type, direction: norm, item: equipment });
  }
}