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

    // new: crafting / gear UI settings
    this.recipesToShow = 3;
    this.craftingFont = '11px sans-serif';
    this.gearFont = '11px sans-serif';
    this.craftBadgeColor = '#2ecc71';
    this.craftBadgeDisabled = '#555';
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

    // --- Crafting UI ---
    const recipes = player.recipes || []; // expected: [{name, ingredients: {wood:2,iron:1}}]
    let craftY = inventoryY + 18;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Crafting:', this.x + this.padding, craftY);
    craftY += 16;
    ctx.font = this.craftingFont;

    for (let i = 0; i < Math.min(this.recipesToShow, recipes.length); i++) {
      const r = recipes[i];
      const lineX = this.x + this.padding + 8;
      // recipe name
      ctx.fillStyle = '#aef';
      ctx.fillText(r.name || 'Unknown', lineX, craftY);

      // ingredients (compact)
      const ingrX = lineX + 80;
      let ingrOffsetX = 0;
      ctx.font = this.craftingFont;
      for (const [res, amt] of Object.entries(r.ingredients || {})) {
        const have = (player.inventory && (player.inventory[res] || 0));
        const text = `${res}:${amt}`;
        // color by whether player has enough
        ctx.fillStyle = have >= amt ? '#9f9' : '#f88';
        ctx.fillText(text, ingrX + ingrOffsetX, craftY);
        ingrOffsetX += 52;
      }

      // craftable badge
      const craftable = Object.entries(r.ingredients || {}).every(([res, amt]) => {
        return (player.inventory && (player.inventory[res] || 0)) >= amt;
      });
      ctx.fillStyle = craftable ? this.craftBadgeColor : this.craftBadgeDisabled;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(craftable ? 'CRAFT' : '---', this.x + this.w - this.padding - 6, craftY);
      ctx.textAlign = 'start';
      craftY += 16;
      ctx.font = this.craftingFont;
    }
    if (recipes.length === 0) {
      ctx.fillStyle = '#888';
      ctx.font = this.craftingFont;
      ctx.fillText('(no recipes learned)', this.x + this.padding + 10, craftY);
      craftY += 14;
    }

    // --- Gear Progression ---
    const gear = player.gear || player.equipment || []; // expected: [{name, level, xp, xpToNext}]
    let gearY = craftY + 8;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Gear:', this.x + this.padding, gearY);
    gearY += 14;
    ctx.font = this.gearFont;
    const gearShow = Math.min(3, gear.length);
    for (let i = 0; i < gearShow; i++) {
      const g = gear[i];
      const gx = this.x + this.padding + 8;
      // name + level
      ctx.fillStyle = '#aef';
      const name = g?.name || 'Empty';
      const level = g?.level || 0;
      ctx.fillText(`${name} Lv.${level}`, gx, gearY);

      // small progress bar to right
      const barW = 60;
      const barH = 8;
      const bx = this.x + this.w - this.padding - barW - 6;
      const by = gearY - 10;
      ctx.fillStyle = '#333';
      roundRect(ctx, bx, by, barW, barH, 3, true, false);
      const xp = g?.xp || 0;
      const toNext = Math.max(1, g?.xpToNext || 100);
      const pct = Math.max(0, Math.min(1, xp / toNext));
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(bx, by, Math.round(barW * pct), barH);

      gearY += 18;
    }
    if (gear.length === 0) {
      ctx.fillStyle = '#888';
      ctx.fillText('(no gear)', this.x + this.padding + 10, gearY);
      gearY += 14;
    }

    // adjust hotbar Y to avoid overlapping with new sections
    const hotbarX = this.x + this.padding;
    // compute a hotbarY that doesn't overlap the gear area
    const minHotbarY = gearY + 6;
    const defaultHotbarY = this.y + this.h - 45;
    const hotbarYAdjusted = Math.max(defaultHotbarY, minHotbarY);
    const slotSize = 28;
    const slotPadding = 6;
    const hotbarSlots = player.hotbar ? player.hotbar.length : 5;
    for (let i = 0; i < hotbarSlots; i++) {
      const sx = hotbarX + i * (slotSize + slotPadding);
      const sy = hotbarYAdjusted;
      // Background
      ctx.fillStyle = (player.selectedHotbarIndex === i) ? '#666' : '#333';
      roundRect(ctx, sx, sy, slotSize, slotSize, 4, true, false);

      // Draw icon/text
      const slot = (player.hotbar && player.hotbar[i]) ? player.hotbar[i] : null;
      ctx.fillStyle = slot ? '#fff' : '#888';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = slot ? (slot.type) : '-';
      ctx.fillText(label, sx + slotSize / 2, sy + slotSize / 2);
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