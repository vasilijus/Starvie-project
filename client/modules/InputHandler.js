export default class InputHandler {
  constructor(canvas, player, network) {
    this.canvas = canvas;
    this.player = player;
    this.network = network;
    this.keys = {};
    window.addEventListener('keydown', e => this.keys[e.key] = true);
    window.addEventListener('keyup', e => this.keys[e.key] = false);
    window.addEventListener('click', e => this.handleClick(e));
    this.startSendLoop();
  }

  startSendLoop() {
    const send = () => {
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
    this.network.emit('playerAction', { type, direction: norm, item: equipment });
  }
}