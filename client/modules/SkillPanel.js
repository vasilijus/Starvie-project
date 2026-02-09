export default class SkillPanel {
  constructor(opts = {}) {
    this.x = opts.x ?? 10;
    this.y = opts.y ?? 150;
    this.w = opts.width ?? 200;
    this.h = opts.height ?? 250;
    this.padding = 10;
    this.isOpen = false;
    this.skillSystem = null;

    this.setupUI();
  }

  setSkillSystem(skillSystem) {
    this.skillSystem = skillSystem;
  }

  setupUI() {
    const panel = document.createElement('div');
    panel.id = 'skillPanel';
    panel.style.cssText = `
      position: fixed;
      left: ${this.x}px;
      top: ${this.y}px;
      width: ${this.w}px;
      background: rgba(0,0,0,0.8);
      color: #fff;
      border: 2px solid #9cf;
      border-radius: 6px;
      padding: ${this.padding}px;
      font-family: sans-serif;
      font-size: 12px;
      z-index: 550;
    `;

    const header = document.createElement('div');
    header.style.fontWeight = 'bold';
    header.style.marginBottom = '8px';
    header.textContent = 'SKILLS';
    panel.appendChild(header);

    const skillsWrap = document.createElement('div');
    skillsWrap.id = 'skillsList';
    panel.appendChild(skillsWrap);

    document.body.appendChild(panel);
    this.panel = panel;
    this.skillsWrap = skillsWrap;
  }

  refresh(player) {
    if (!this.skillSystem) return;
    this.skillsWrap.innerHTML = '';

    const skillKeys = Object.keys(this.skillSystem.skills);
    skillKeys.forEach(key => {
      const skillDef = this.skillSystem.skills[key];
      const info = this.skillSystem.getSkillInfo(player, key);

      const card = document.createElement('div');
      card.style.marginBottom = '10px';
      card.style.padding = '6px';
      card.style.background = '#111';
      card.style.borderRadius = '4px';

      const name = document.createElement('div');
      name.style.color = skillDef.color;
      name.style.fontWeight = '600';
      name.style.fontSize = '11px';
      name.textContent = `${skillDef.name} Lv.${info.level}`;
      card.appendChild(name);

      const bar = document.createElement('div');
      bar.style.marginTop = '4px';
      bar.style.position = 'relative';
      bar.style.height = '10px';
      bar.style.background = '#222';
      bar.style.border = '1px solid #333';
      bar.style.borderRadius = '6px';
      bar.style.overflow = 'hidden';

      const inner = document.createElement('div');
      const pct = Math.max(0, Math.min(1, info.xp / info.xpToNext));
      inner.style.width = `${Math.round(pct * 100)}%`;
      inner.style.height = '100%';
      inner.style.background = skillDef.color;
      bar.appendChild(inner);

      const xpLabel = document.createElement('div');
      xpLabel.style.position = 'absolute';
      xpLabel.style.fontSize = '9px';
      xpLabel.style.color = '#fff';
      xpLabel.style.opacity = '0.8';
      xpLabel.style.left = '3px';
      xpLabel.style.top = '0';
      xpLabel.style.lineHeight = '10px';
      xpLabel.textContent = `${info.xp}/${info.xpToNext}`;
      bar.appendChild(xpLabel);

      card.appendChild(bar);
      this.skillsWrap.appendChild(card);
    });
  }

  draw(ctx, player) {
    // refresh UI each frame
    if (player && this.skillSystem) {
      this.refresh(player);
    }
  }
}
