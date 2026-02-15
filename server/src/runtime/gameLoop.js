import { applyPlayerMovement } from '../systems/movement/MovementSystem.js';
import { updateEnemiesAI } from '../systems/enemy/EnemySystem.js';

const TICK_RATE = 1000 / 30;
const VIEW_RADIUS = 700;
const VIEW_RADIUS_SQ = VIEW_RADIUS * VIEW_RADIUS;

function isWithinView(entity, player) {
  if (!entity || !player) return false;
  const dx = entity.x - player.x;
  const dy = entity.y - player.y;
  return (dx * dx + dy * dy) <= VIEW_RADIUS_SQ;
}

function processMovementQueue(state) {
  while (state.movementQueue.length > 0) {
    const { id, dir } = state.movementQueue.shift();
    const player = state.players[id];
    applyPlayerMovement(player, dir, state.worldSize, state.resources);
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

function buildPlayersPayload(state) {
  return Object.fromEntries(
    Object.entries(state.players).map(([id, player]) => [id, player.toClient()])
  );
}

function buildVisibleResources(state, player) {
  return state.resources
    .filter((resource) => isWithinView(resource, player))
    .map((resource) => resource.toObject?.() ?? resource);
}

function buildVisibleEnemies(state, player) {
  return state.enemies.filter((enemy) => isWithinView(enemy, player));
}

function broadcastState(io, state) {
  const playersPayload = buildPlayersPayload(state);

  for (const [socketId, player] of Object.entries(state.players)) {
    const visibleDrops = state.enemyDrops
      .filter((drop) => drop.isVisibleTo?.(socketId) && isWithinView(drop, player))
      .map((drop) => drop.toObject());

    io.to(socketId).emit('state', {
      players: playersPayload,
      enemies: buildVisibleEnemies(state, player),
      world: state.world,
      resources: buildVisibleResources(state, player),
      enemyDrops: visibleDrops
    });
  }
}

export function startGameLoop(io, state) {
  setInterval(() => {
    const delta = TICK_RATE;

    processMovementQueue(state);
    updateResources(state, delta);
    cleanupDrops(state);

    const alivePlayers = getAlivePlayers(state);
    updateEnemiesAI(state.enemies, alivePlayers, state.worldSize, state.resources);

    broadcastState(io, state);
  }, TICK_RATE);
}
