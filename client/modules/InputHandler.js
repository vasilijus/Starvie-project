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
    this.startSendLoop();
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
    const type = (equipment === 'sword' || equipment === 'axe') ? 'attack' : 'interact';

    this.network.emit('playerAction', 
      { 
        type, 
        direction: norm, 
        item: equipment 
      }
    );
  }
}