import express from "express";
import http from "http";
import { Server } from "socket.io";
import { generateWorld, WORLD_CHUNKS, CHUNK_SIZE, TILE_SIZE } from "./map/ProceduralMap.js";
import { Player } from './modules/Player.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("../client"));

const world = generateWorld();
const WORLD_SIZE = WORLD_CHUNKS * CHUNK_SIZE * TILE_SIZE; // Calculate world size based on chunks, chunk size, and tile size  

const players = {};
const enemies = [
  // Example enemy data
  // "enemy1": { x: 500, y: 500, hp: 50 },
  // "enemy2": { x: 1500, y: 1500, hp: 75 }
];
const resources = [
  // Example resource data
  // "resource1": { x: 300, y: 300, type: "wood", hp: 100, icon_color: "brown" },
  // "resource2": { x: 800, y: 800, type: "stone", hp: 100, icon_color: "gray" }
]

function getBiome(x, y) {
  const chunkX = Math.floor(x / (CHUNK_SIZE * TILE_SIZE));
  const chunkY = Math.floor(y / (CHUNK_SIZE * TILE_SIZE));
  const chunkKey = `${chunkX},${chunkY}`;
  return world.chunks[chunkKey] ? world.chunks[chunkKey].biome : "unknown";
}

// function spawnResources() {
//   const biome = getBiome(Math.random() * WORLD_SIZE, Math.random() * WORLD_SIZE);
//   const resourceTypes = {
//     "forest": ["wood", "berries"],
//     "plains": ["grass", "flowers"],
//     "desert": ["sand", "cactus"]
//   };
//   const type = resourceTypes[biome] ? resourceTypes[biome][Math.floor(Math.random() * resourceTypes[biome].length)] : "unknown";
//   const id = `resource${Date.now()}`;
//   resources.push({
//     id: id,
//     x: Math.random() * WORLD_SIZE,
//     y: Math.random() * WORLD_SIZE,
//     type: type,
//     biome: biome,
//     hp: 100 // Resources can have HP to indicate how much can be harvested
//   });
// }

function getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

function spawnResources(x, y) {
  const biome = getBiome(x, y);
  let {resourceType, icon_color} = {};
  switch (biome) {
    case "forest":
      resourceType = "wood";
      icon_color = "brown";
      break;
    case "plains":
      resourceType = "food";
      icon_color = "orange";
      break;
    case "desert":
      resourceType = "stone";
      icon_color = "gray";
      break;
    default:
      resourceType = "unknown";
      icon_color = "black";
  }
  const resourceId = `resource${Date.now()}`;
  resources.push({ id: resourceId, x, y, type: resourceType, hp: 100, icon_color: icon_color });
}


// Spawn resources
for (let i = 0; i < 100; i++) {
  spawnResources(Math.random() * WORLD_SIZE, Math.random() * WORLD_SIZE);
}
// setInterval(spawnResources, 5000); // Spawn a new resource every 5 seconds

// Spawn enemies at random positions within the world
for (let i = 0; i < 101; i++) {
  const id = `enemy${i}`;
  enemies.push({
    id: id,
    x: Math.floor(Math.random() * WORLD_SIZE),
    y: Math.floor(Math.random() * WORLD_SIZE),
    hp: 50 + Math.floor(Math.random() * 50) // Random HP between 50 and 100
  });
}


io.on("connection", socket => {
  players[socket.id] = new Player(
    socket.id,
    Math.floor(Math.random() * WORLD_SIZE),
    Math.floor(Math.random() * WORLD_SIZE)
  );

  socket.on("playerInput", dir => {
    const p = players[socket.id];
    if (!p) return;

    // Update player position based on input direction and speed
    p.x += dir.x * 5;
    p.y += dir.y * 5;

    // Keep player within world bounds
    p.x = Math.max(0, Math.min(WORLD_SIZE, p.x));
    p.y = Math.max(0, Math.min(WORLD_SIZE, p.y));
  });

  socket.on("harvestResource", resourceId => {
    const resourceIndex = resources.findIndex(r => r.id === resourceId);
    if (resourceIndex !== -1) {
      const resource = resources[resourceIndex];
      // Add resource to player's inventory (not implemented here)
      const p = players[socket.id];

      p.inventory = p.inventory || [];
      p.inventory.push(resource.type);
      // For example: players[socket.id].inventory.push(resource.type);
      resources.splice(resourceIndex, 1); // Remove harvested resource from the game
    }
  });

  socket.on('playerAction', (data) => {
      const player = players[socket.id];
      if (!player || !player.isAlive) return;

      const reach = 40; // How far the player reaches
      const hitRadius = 30; // The size of the "hit" area

      // 1. Calculate the exact point in the world the player is "hitting"
      const hitX = player.x + (data.direction.x * reach);
      const hitY = player.y + (data.direction.y * reach);

      // 2. Check for Enemies (Combat Logic)
      // We look for any enemy close to our hit point
      const hitEnemy = enemies.find(enemy => 
          getDistance(hitX, hitY, enemy.x, enemy.y) < hitRadius
      );

      if (hitEnemy) {
          // Apply damage logic
          const baseDamage = 10;
          const multiplier = data.weapon ? 2.5 : 1.0; 
          const totalDamage = baseDamage * multiplier;

          hitEnemy.hp -= totalDamage;
          console.log(`Enemy ${hitEnemy.id} hit for ${totalDamage}!`);
          
          // Remove enemy if dead
          if (hitEnemy.hp <= 0) {
              const index = enemies.indexOf(hitEnemy);
              enemies.splice(index, 1);
          }
          return; // Stop here if we hit an enemy
      }

      // 3. Check for Resources (Gathering Logic)
      // If no enemy was hit, check if we clicked a resource
      const hitResource = resources.find(res => 
          getDistance(hitX, hitY, res.x, res.y) < 25
      );

      if (hitResource) {
          console.log(`Gathering resource: ${hitResource.type}`);
          
          // Logic to give player items
          if (!player.inventory) player.inventory = [];
          player.inventory.push(hitResource.type);

          // Remove resource from world
          const resIndex = resources.indexOf(hitResource);
          resources.splice(resIndex, 1);
      }
  });

  socket.on("disconnect", () => {
    // Remove player from the game when they disconnect
    delete players[socket.id];
  });
});

// Broadcast game state to all clients at 30 FPS
setInterval(() => {
  // Add AI loop here to update enemy positions and handle interactions
  for (const enemy of enemies) {
    let closestPlayer = null;
    let distance = Infinity;
    let alivePlayers = [];
    // // If no players are connected, skip AI processing
    // if (Object.keys(players).length === 0) continue;

    // Check if player is within a certain range (e.g., 300 units)
    for (const id in players) {
      const p = players[id];
      if (!checkIfPlayerAlive(p)) {
        delete players[id]; // Remove dead player from the game
      } else {
        alivePlayers.push(p);
      }
    }

    if (alivePlayers.length === 0) continue; // Skip if no alive players
    else {
        
      for (const p of alivePlayers) {
        const dx = p.x - enemy.x;
        const dy = p.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < distance) {
          distance = dist;
          closestPlayer = p;
        }
      }
    }
    
    const huntRange = 200; // Distance at which enemies will start chasing players
    if (distance < huntRange) {
      // Move towards the closest player
      const angle = Math.atan2(closestPlayer.y - enemy.y, closestPlayer.x - enemy.x);
      enemy.x += Math.cos(angle) * 2; // Enemy speed
      enemy.y += Math.sin(angle) * 2;
    } else {
      // Make enemies move randomly if no player is nearby, but in a more natural way, following a more linear path instead of jittery random movement
      if (!enemy.moveDirection || Math.random() < 0.01) { // Change direction randomly every 100 frames on average
        const angle = Math.random() * 2 * Math.PI;
        enemy.moveDirection = { x: Math.cos(angle), y: Math.sin(angle) };
      }
      enemy.x += enemy.moveDirection.x * 1; // Slower random movement
      enemy.y += enemy.moveDirection.y * 1;

    }

    // Keep enemy within world bounds
    enemy.x = Math.max(0, Math.min(WORLD_SIZE, enemy.x));
    enemy.y = Math.max(0, Math.min(WORLD_SIZE, enemy.y));

    
    // Check if player HP is reduced to 0 or below and remove player from the game
    if (closestPlayer && closestPlayer.hp <= 0) {
      // Find the player ID to remove from the players object
      for (const id in players) {
        if (players[id] === closestPlayer) {
          players[id].hp = 0; // Set player HP to 0 to indicate they are "dead"
          players[id].isAlive = false; // Mark player as not alive
          delete players[id];
          break;
        }
      }
    }
    
    // Enemies attack player if close enough
    // Check for collisions with players and reduce HP
    const dx = closestPlayer.x - enemy.x;
    const dy = closestPlayer.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 20) { // Collision radius
      console.log(`Enemy ${enemy.id} attacks player for 1 damage!`);
      closestPlayer.takeDamage(1); // Reduce player HP using the Player class method
      // closestPlayer.hp -= 1; // Reduce player HP
      enemy.hp -= 1; // Reduce enemy aHP
      if (enemy.hp <= 0) {
        enemies.splice(enemies.indexOf(enemy), 1); // Remove dead enemy
      }
    }


  }

  // Broadcast updated game state to all clients
  const statePlayers = Object.fromEntries(
    Object.entries(players).map(([id, p]) => [id, p.toClient()])
  );
  io.emit("state", { players: statePlayers, enemies, world, resources });
}, 1000 / 30);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const checkIfPlayerAlive = (person) => {
  if (person.hp <= 0) {
    person.isAlive = false;
    return false;
  }
  return true;
}