import { applyPlayerMovement } from '../systems/movement/MovementSystem.js';
import { updateEnemiesAI } from '../systems/enemy/EnemySystem.js';

const TICK_RATE = 1000 / 30;

function processMovementQueue(state) {
  while (state.movementQueue.length > 0) {
    const { id, dir } = state.movementQueue.shift();
    const player = state.players[id];
    applyPlayerMovement(player, dir, state.worldSize);
  }
}

function getAlivePlayers(state) {
  const alive = [];

  for (const id in state.players) {
    const player = state.players[id];

    if (player.hp <= 0) {
      delete state.players[id];
      continue;
    }

    alive.push(player);
  }

  return alive;
}

function updateResources(state, delta) {
  for (const resource of state.resources) {
    resource.updateRespawn?.(delta);
  }
}

function cleanupDrops(state) {
  for (let i = state.enemyDrops.length - 1; i >= 0; i--) {
    if (state.enemyDrops[i].shouldDespawn()) {
      state.enemyDrops.splice(i, 1);
    }
  }
}

function broadcastState(io, state) {
  const statePlayers = Object.fromEntries(
    Object.entries(state.players).map(([id, player]) => [id, player.toClient()])
  );

  io.emit('state', {
    players: statePlayers,
    enemies: state.enemies,
    world: state.world,
    resources: state.resources.map((r) => r.toObject?.() ?? r),
    enemyDrops: state.enemyDrops.map((drop) => drop.toObject()),
  });
}

export function startGameLoop(io, state) {
  setInterval(() => {
    const delta = TICK_RATE;

    processMovementQueue(state);
    updateResources(state, delta);
    cleanupDrops(state);

    const alivePlayers = getAlivePlayers(state);
    updateEnemiesAI(state.enemies, alivePlayers, state.worldSize);

    broadcastState(io, state);
  }, TICK_RATE);
}
