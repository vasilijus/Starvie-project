import fs from 'fs';
import path from 'path';
import { ServerPlayer } from '../modules/ServerPlayer.js';
import { getHitPoint, findHitEnemy, findHitResource } from '../gameplay/TargetingSystem.js';
import { attackEnemy } from '../gameplay/CombatSystem.js';
import { collectEnemyDrop, harvestWorldResource } from '../gameplay/HarvestSystem.js';
import { updateFacingDirection } from '../gameplay/PlayerStateSystem.js';

export function registerSocketHandlers(io, state) {
  io.on('connection', (socket) => {
    state.players[socket.id] = new ServerPlayer(
      socket.id,
      `Player_${socket.id.substring(0, 8)}`,
      Math.floor(Math.random() * state.worldSize),
      Math.floor(Math.random() * state.worldSize)
    );

    socket.on('playerJoin', (data) => {
      const player = state.players[socket.id];
      if (player && data.name) {
        player.name = data.name;
        console.log(`Player ${socket.id} joined as: ${player.name}`);
      }
    });

    socket.on('saveMap', (chunksData) => {
      if (!chunksData || typeof chunksData !== 'object') {
        console.warn('Invalid map data received');
        socket.emit('mapSaveResult', { success: false, message: 'Invalid data' });
        return;
      }

      try {
        const mapsDir = path.join(process.cwd(), 'server', 'maps');
        if (!fs.existsSync(mapsDir)) {
          fs.mkdirSync(mapsDir, { recursive: true });
        }

        const mapPath = path.join(mapsDir, 'map.json');
        fs.writeFileSync(mapPath, JSON.stringify(chunksData, null, 2), 'utf8');

        state.world.chunks = chunksData;
        socket.emit('mapSaveResult', { success: true, message: 'Map saved successfully' });
      } catch (err) {
        console.error(`✗ Failed to save map: ${err.message}`);
        socket.emit('mapSaveResult', { success: false, message: err.message });
      }
    });

    socket.on('playerInput', (dir) => {
      state.movementQueue.push({ id: socket.id, dir });
    });

    socket.on('playerFacingDirection', (direction) => {
      updateFacingDirection(state.players[socket.id], direction);
    });

    socket.on('harvestResource', (resourceId) => {
      const player = state.players[socket.id];
      if (!player) return;

      const resourceIndex = state.resources.findIndex((r) => r.id === resourceId);
      if (resourceIndex !== -1) {
        harvestWorldResource(player, state.resources[resourceIndex]);
        return;
      }

      const dropIndex = state.enemyDrops.findIndex((d) => d.id === resourceId);
      if (dropIndex !== -1) {
        const collected = collectEnemyDrop(player, state.enemyDrops[dropIndex]);
        if (collected) state.enemyDrops.splice(dropIndex, 1);
      }
    });

    socket.on('playerAction', (data) => {
      const player = state.players[socket.id];
      if (!player?.isAlive) return;

      const hitPoint = getHitPoint(player, data.direction);
      const enemy = findHitEnemy(hitPoint, state.enemies);

      if (enemy) {
        const result = attackEnemy(player, enemy, state.enemyDrops);
        if (result.killed) {
          const index = state.enemies.indexOf(enemy);
          state.enemies.splice(index, 1);
        }

        io.emit('hitEffect', { x: hitPoint.x, y: hitPoint.y, type: 'combat' });
        return;
      }

      const resource = findHitResource(hitPoint, state.resources);
      if (resource && harvestWorldResource(player, resource)) {
        io.emit('hitEffect', { x: hitPoint.x, y: hitPoint.y, type: 'gather' });
      }
    });

    socket.on('disconnect', () => {
      delete state.players[socket.id];
    });
  });
}
