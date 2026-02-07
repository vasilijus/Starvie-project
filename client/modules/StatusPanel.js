export default class StatusPanel {
  constructor(opts = {}) {
    this.x = opts.x ?? 10;
    this.y = opts.y ?? 10;
    this.w = opts.width ?? 200;
    this.h = opts.height ?? 130; // Increased height for inventory
    this.bg = opts.bgColor ?? 'rgba(0,0,0,0.6)';
    this.barBg = opts.barBg ?? '#444';
    this.barFg = opts.barColor ?? '#4caf50';
    this.font = opts.font ?? '14px sans-serif';
    this.padding = 8;
  }

  draw(ctx, player) {
    const lvl = player.level || 1;
    const xp = player.xp || 0;
    const next = player.xpToNextLevel || 100;
    const inventory = player.inventory || {};

    // background box
    ctx.save();
    ctx.translate(0,0);
    ctx.fillStyle = this.bg;
    roundRect(ctx, this.x, this.y, this.w, this.h, 6, true, false);

    // Level text
    ctx.fillStyle = '#fff';
    ctx.font = this.font;
    ctx.textBaseline = 'top';
    ctx.fillText(`Level ${lvl}`, this.x + this.padding, this.y + this.padding);

    // XP bar
    const barX = this.x + this.padding;
    const barY = this.y + this.h - 85;
    const barW = this.w - this.padding * 2;
    const barH = 12;
    ctx.fillStyle = this.barBg;
    ctx.fillRect(barX, barY, barW, barH);
    const pct = Math.max(0, Math.min(1, xp / Math.max(1, next)));
    ctx.fillStyle = this.barFg;
    ctx.fillRect(barX, barY, Math.round(barW * pct), barH);

    // xp text
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`XP: ${xp} / ${next}`, barX + 6, barY - 12);

    // Inventory header
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Resources:', this.x + this.padding, barY + 20);

    // Draw inventory items
    let inventoryY = barY + 35;
    const maxItems = 3; // Show max 3 items
    let itemCount = 0;
    
    for (const [resourceType, amount] of Object.entries(inventory)) {
      if (itemCount >= maxItems) break;
      ctx.fillStyle = '#aef';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${resourceType}: ${amount}`, this.x + this.padding + 10, inventoryY);
      inventoryY += 15;
      itemCount++;
    }

    if (itemCount === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '11px sans-serif';
      ctx.fillText('(empty)', this.x + this.padding + 10, inventoryY);
    }

    ctx.restore();
  }
}

// helper: rounded rect
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof r === 'undefined') r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}