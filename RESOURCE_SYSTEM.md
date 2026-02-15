
Notes
- The hotbar UI rendering is already implemented in `client/modules/StatusPanel.js` and the hotbar state/actions are in `client/modules/ClientPlayer.js` (methods: `selectHotbar`, `setHotbarSlot`, `getSelectedItem`). No change required there. See [`ClientPlayer`](client/modules/ClientPlayer.js) and [`StatusPanel`](client/modules/StatusPanel.js).
- The InputHandler now consistently uses `this.lastState` (set by `client/main.js` when 'state' arrives) and will emit `harvestResource` for both environment resources and enemy drops.
- Number keys (1..5) select hotbar slots via existing logic in InputHandler.startSendLoop() and ClientPlayer.selectHotbar().

Todo (updated)
- [x] Fix client click -> harvest emission (InputHandler) — replaced and fixed variable/confusion.
- [x] Instantiate and draw StatusPanel (hotbar + inventory) in game loop (`client/main.js`).
- [x] Ensure hotbar selection works with number keys (1..5) using InputHandler + ClientPlayer.
- [ ] Persist hotbar/inventory changes to server (server-side inventory sync already exists; may need mapping of hotbar assignments to persistent player data) — pending.
- [ ] Add drag/drop or UI to populate hotbar from server inventory — pending (UX work).
- [ ] Add equip/tool effects on harvest (eg. axe reduces time / increases yield) — pending.

If you want I can:
- Create the server-side persistence for hotbar (so server stores which hotbar slot contains which item).
- Add UI to pick items from inventory into a hotbar slot (drag/drop or click-to-assign).
- Commit these changes directly into the repo (if you enable file editing for me).

Which next step do you want me to do now?Notes
- The hotbar UI rendering is already implemented in `client/modules/StatusPanel.js` and the hotbar state/actions are in `client/modules/ClientPlayer.js` (methods: `selectHotbar`, `setHotbarSlot`, `getSelectedItem`). No change required there. See [`ClientPlayer`](client/modules/ClientPlayer.js) and [`StatusPanel`](client/modules/StatusPanel.js).
- The InputHandler now consistently uses `this.lastState` (set by `client/main.js` when 'state' arrives) and will emit `harvestResource` for both environment resources and enemy drops.
- Number keys (1..5) select hotbar slots via existing logic in InputHandler.startSendLoop() and ClientPlayer.selectHotbar().

Todo (updated)
- [x] Fix client click -> harvest emission (InputHandler) — replaced and fixed variable/confusion.
- [x] Instantiate and draw StatusPanel (hotbar + inventory) in game loop (`client/main.js`).
- [x] Ensure hotbar selection works with number keys (1..5) using InputHandler + ClientPlayer.
- [ ] Persist hotbar/inventory changes to server (server-side inventory sync already exists; may need mapping of hotbar assignments to persistent player data) — pending.
- [ ] Add drag/drop or UI to populate hotbar from server inventory — pending (UX work).
- [ ] Add equip/tool effects on harvest (eg. axe reduces time / increases yield) — pending.

If you want I can:
- Create the server-side persistence for hotbar (so server stores which hotbar slot contains which item).
- Add UI to pick items from inventory into a hotbar slot (drag/drop or click-to-assign).
- Commit these changes directly into the repo (if you enable file editing for me).

Which next step do you want me to do now?

---

## Latest Resource System Notes

### New Resource Types
- `gold`: rare, high-value resource.
- `grain`: common food/crafting ingredient.

### Resource Rendering & Authoring
- Resource shape/style is now driven by `resourceVisualDefinitions`.
- Added `client/resource-editor.html` to tune render radius, collision radius, and collision offsets.
- Editor resource list is loaded dynamically from JS definitions (no duplicated static HTML type list).

### Collision Alignment
- Tree collisions can be trunk-aligned with `collisionOffsetY`.
- Solid-resource collision uses server-authoritative geometry with reduced radius and offset-aware center points.
- Collision debug drawing is available in the resource drawer tooling.
