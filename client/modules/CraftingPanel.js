export default class CraftingPanel {
    constructor(opts = {}) {
        this.x = opts.x ?? 10;
        this.y = opts.y ?? 10;
        this.w = opts.width ?? 320;
        this.h = opts.height ?? 420;
        this.padding = opts.padding ?? 10;
        this.isOpen = false;
        this.craftingRules = null;
        this.craftQueue = []; // { recipeIndex, recipeName, timeRemaining, totalTime, result }
        this.playerRef = null; // last known player for refresh
        this.skillSystem = null; // set externally via setSkillSystem()

        this.setupUI();
    }

    setupUI() {
        // create container similar to MapEditor style
        const panel = document.createElement('div');
        panel.id = 'craftingPanel';
        panel.style.cssText = `
			position: fixed;
			left: ${this.x}px;
			top: ${this.y}px;
			width: ${this.w}px;
			height: ${this.h}px;
			background: rgba(0,0,0,0.8);
			color: #fff;
			border: 2px solid #6cf;
			border-radius: 6px;
			padding: ${this.padding}px;
			font-family: sans-serif;
			font-size: 13px;
			z-index: 600;
			display: none;
			overflow: auto;
		`;

        // header
        const header = document.createElement('div');
        header.style.fontWeight = 'bold';
        header.style.marginBottom = '8px';
        header.textContent = 'CRAFTING (C)';
        panel.appendChild(header);

        // recipes container
        const recipesWrap = document.createElement('div');
        recipesWrap.id = 'craftingRecipes';
        panel.appendChild(recipesWrap);

        // queue header + container
        const queueHeader = document.createElement('div');
        queueHeader.style.marginTop = '12px';
        queueHeader.style.fontWeight = 'bold';
        queueHeader.textContent = 'Queue';
        panel.appendChild(queueHeader);

        const queueWrap = document.createElement('div');
        queueWrap.id = 'craftingQueue';
        queueWrap.style.minHeight = '40px';
        panel.appendChild(queueWrap);

        // helpful note
        const note = document.createElement('div');
        note.style.fontSize = '11px';
        note.style.opacity = '0.85';
        note.style.marginTop = '8px';
        note.textContent = 'Click C to toggle. Click CRAFT to queue (consumes ingredients immediately).';
        panel.appendChild(note);

        document.body.appendChild(panel);
        this.panel = panel;
        this.recipesWrap = recipesWrap;
        this.queueWrap = queueWrap;
    }

    setRules(rules) {
        this.craftingRules = rules;
        this.renderRecipes();
    }

    setSkillSystem(skillSystem) {
        this.skillSystem = skillSystem;
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.panel.style.display = this.isOpen ? 'block' : 'none';
        return this.isOpen;
    }

    // Refresh recipe buttons / ingredient colors based on player inventory
    refresh(player) {
        this.playerRef = player;
        if (!this.craftingRules) return;
        const recipes = this.craftingRules.recipes || [];
        // update each card
        for (let i = 0; i < recipes.length; i++) {
            const card = document.getElementById(`craft-card-${i}`);
            if (!card) continue;
            const r = recipes[i];
            const can = this.craftingRules.canCraft(player, r);
            // toggle button
            const btn = card.querySelector('.craft-btn');
            if (btn) btn.disabled = !can;
            // update ingredient line colors
            const ingrLine = card.querySelector('.ingr-line');
            if (ingrLine) {
                ingrLine.innerHTML = Object.entries(r.ingredients || {}).map(([k, v]) => {
                    const have = (player.inventory && player.inventory[k]) || 0;
                    const ok = have >= v;
                    return `<span style="color:${ok ? '#9f9' : '#f88'}">${k}:${v}</span>`;
                }).join(' ');
            }
        }
    }

    renderRecipes() {
        this.recipesWrap.innerHTML = '';
        if (!this.craftingRules) return;
        const recipes = this.craftingRules.recipes || [];
        recipes.forEach((r, i) => {
            const card = document.createElement('div');
            card.id = `craft-card-${i}`;
            card.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px;border-radius:6px;margin-bottom:8px;background:#111;';
            // left: name + ingredients
            const left = document.createElement('div');
            left.style.flex = '1';
            const name = document.createElement('div');
            name.textContent = r.name || `Recipe ${i + 1}`;
            name.style.color = '#aef';
            name.style.fontWeight = '600';
            name.style.marginBottom = '4px';
            left.appendChild(name);

            const ingr = document.createElement('div');
            ingr.className = 'ingr-line';
            ingr.style.fontSize = '12px';
            ingr.style.opacity = '0.9';
            left.appendChild(ingr);

            const time = document.createElement('div');
            time.style.fontSize = '11px';
            time.style.opacity = '0.8';
            time.textContent = `${(r.craftTime || 2)}s`;
            left.appendChild(time);

            card.appendChild(left);

            // right: craft button
            const right = document.createElement('div');
            right.style.marginLeft = '10px';
            const btn = document.createElement('button');
            btn.className = 'craft-btn';
            btn.textContent = 'CRAFT';
            btn.style.cssText = 'padding:8px 10px;border-radius:4px;border:none;background:#4caf50;color:#000;cursor:pointer;font-weight:700';
            btn.addEventListener('click', () => {
                if (!this.playerRef) return;
                this.queueCraft(this.playerRef, i);
            });
            right.appendChild(btn);
            card.appendChild(right);

            this.recipesWrap.appendChild(card);
        });
        // attempt an initial refresh if we have a player
        if (this.playerRef) this.refresh(this.playerRef);
    }

    // queue craft: consumes ingredients immediately, result added when craft finishes
    queueCraft(player, recipeIndex) {
        if (!this.craftingRules) return false;
        const recipes = this.craftingRules.recipes || [];
        const r = recipes[recipeIndex];
        if (!r) return false;
        if (!this.craftingRules.canCraft(player, r)) {
            // optional flash
            const card = document.getElementById(`craft-card-${recipeIndex}`);
            if (card) {
                card.style.boxShadow = '0 0 8px #f44';
                setTimeout(() => card.style.boxShadow = '', 300);
            }
            return false;
        }

        // consume ingredients now
        player.inventory = player.inventory || {};
        for (const [k, v] of Object.entries(r.ingredients || {})) {
            player.inventory[k] = Math.max(0, (player.inventory[k] || 0) - v);
        }

        // Apply crafting skill time reduction
        let craftTime = r.craftTime || 2;
        if (this.skillSystem) {
            const reduction = this.skillSystem.getCraftTimeReduction(player);
            craftTime = Math.max(0.5, craftTime * (1 - reduction));
        }

        // add to queue (result added on completion)
        this.craftQueue.push({
            recipeIndex,
            recipeName: r.name,
            timeRemaining: craftTime,
            totalTime: craftTime,
            result: r.result
        });

        // refresh UI states
        this.refresh(player);
        this.renderQueue();
        return true;
    }

    renderQueue() {
        this.queueWrap.innerHTML = '';
        if (this.craftQueue.length === 0) {
            const empty = document.createElement('div');
            empty.style.color = '#888';
            empty.style.fontSize = '12px';
            empty.textContent = '(empty)';
            this.queueWrap.appendChild(empty);
            return;
        }

        this.craftQueue.slice(0, 5).forEach((q, idx) => {
            const row = document.createElement('div');
            row.style.marginBottom = '8px';
            const title = document.createElement('div');
            title.textContent = q.recipeName;
            title.style.color = '#aef';
            title.style.fontSize = '12px';
            title.style.marginBottom = '4px';
            row.appendChild(title);

            const barWrap = document.createElement('div');
            barWrap.style.position = 'relative';
            barWrap.style.height = '12px';
            barWrap.style.background = '#222';
            barWrap.style.border = '1px solid #333';
            barWrap.style.borderRadius = '6px';
            barWrap.style.overflow = 'hidden';

            const inner = document.createElement('div');
            const pct = Math.max(0, Math.min(1, 1 - (q.timeRemaining / q.totalTime)));
            inner.style.width = `${Math.round(pct * 100)}%`;
            inner.style.height = '100%';
            inner.style.background = '#4caf50';
            barWrap.appendChild(inner);

            const timeLabel = document.createElement('div');
            timeLabel.style.position = 'absolute';
            timeLabel.style.right = '6px';
            timeLabel.style.top = '0';
            timeLabel.style.height = '100%';
            timeLabel.style.display = 'flex';
            timeLabel.style.alignItems = 'center';
            timeLabel.style.fontSize = '11px';
            timeLabel.style.color = '#fff';
            timeLabel.textContent = `${q.timeRemaining.toFixed(1)}s`;

            barWrap.appendChild(timeLabel);
            row.appendChild(barWrap);
            this.queueWrap.appendChild(row);
        });
    }

    // called from game loop with seconds
    update(dt) {
        if (this.craftQueue.length === 0) return;
        for (let i = this.craftQueue.length - 1; i >= 0; i--) {
            const item = this.craftQueue[i];
            item.timeRemaining -= dt;
            if (item.timeRemaining <= 0) {
                // Give result to player
                if (this.playerRef && item.result) {
                    const name = item.result.name || item.result.type || 'item';
                    this.playerRef.inventory = this.playerRef.inventory || {};
                    this.playerRef.inventory[name] = (this.playerRef.inventory[name] || 0) + (item.result.count || 1);
                }

                // Award crafting XP
                if (this.playerRef && this.skillSystem) {
                    const xpReward = 25; // tunable
                    const result = this.skillSystem.awardXp(this.playerRef, 'crafting', xpReward);
                    if (result.leveledUp) {
                        console.log(`Crafting skill leveled to ${result.newLevel}!`);
                    }
                }

                this.craftQueue.splice(i, 1);
            }
        }
        // update UI
        this.renderQueue();
        if (this.playerRef) this.refresh(this.playerRef);
    }

    // draw kept for compatibility with canvas render loops (no-op)
    draw(ctx, player) {
        // panel is DOM; keep reference to player to allow button handlers & refresh
        if (player) this.playerRef = player;
        // keep UI in sync
        if (this.isOpen && player) this.refresh(player);
    }

    // legacy: InputHandler may call this; return null (DOM handles clicks)
    getClickableArea(recipeIndex) {
        return null;
    }
}
