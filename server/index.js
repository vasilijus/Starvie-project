import express from "express";
import http from "http";
import { Server } from "socket.io";
import { generateWorld, WORLD_CHUNKS, CHUNK_SIZE, TILE_SIZE, setHandmadeMap} from "./map/ProceduralMap.js";
import { ServerPlayer } from './modules/ServerPlayer.js';
import { Wolf, Bear, EN_TYPES } from "./modules/EnemyTypes.js";
import { generateGUID } from "./util/GUID.js";
import { ResourceFactory } from "./modules/resources/ResourceFactory.js";
import fs from "fs";
import path from "path";

// Try to load a saved map from server/maps/map.json
function loadMapFromFile() {
  const mapPath = path.join(process.cwd(), 'server', 'maps', 'map.json');
  console.log(`Map path: ${mapPath}`)
  try {
    if (fs.existsSync(mapPath)) {
      const mapData = fs.readFileSync(mapPath, 'utf8');
      const chunks = JSON.parse(mapData);
      console.log(`✓ Loaded map from ${mapPath}`);
      setHandmadeMap(chunks);
      return true;
    }
  } catch (err) {
    console.warn(`⚠ Failed to load map: ${err.message}`);
  }
  return false;
}

// Load map at startup
loadMapFromFile();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("../client"));

// Initialize world
const world = generateWorld();
console.log(`World initialized with chunks: ${Object.keys(world.chunks).length}`);

// Load resources from world chunks using ResourceFactory
function loadResourcesFromChunks() {
  const loadedResources = [];
  for (const key in world.chunks) {
    const chunk = world.chunks[key];
    if (chunk.resources && Array.isArray(chunk.resources)) {
      // Create instances using ResourceFactory
      for (const resourceData of chunk.resources) {
        try {
          const resource = ResourceFactory.createResource(
            resourceData.type,
            resourceData.x,
            resourceData.y
          );
          // Override icon color if provided
          if (resourceData.icon_color) {
            resource.icon_color = resourceData.icon_color;
          }
          loadedResources.push(resource);
        } catch (err) {
          console.warn(`Failed to create resource of type ${resourceData.type}: ${err.message}`);
        }
      }
    }
  }
  return loadedResources;
}

const WORLD_SIZE = WORLD_CHUNKS * CHUNK_SIZE * TILE_SIZE; // Calculate world size based on chunks, chunk size, and tile size  

const players = {};
const enemies = [
  // Example enemy data
  // "enemy1": { x: 500, y: 500, hp: 50 },
  // "enemy2": { x: 1500, y: 1500, hp: 75 }
];
const resources = loadResourcesFromChunks();
const enemyDrops = []; // Track drops from defeated enemies

function getDistance(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

// Spawn enemies at random positions within the world
for (let i = 0; i < 20; i++) {
  const id = `enemy${i}`;
  // const hp = 50 + Math.floor(Math.random() * 50) // Random HP between 50 and 100
  // enemies.push({
  //   id: id,
  //   x: Math.floor(Math.random() * WORLD_SIZE),
  //   y: Math.floor(Math.random() * WORLD_SIZE),
  //   hp: hp,
  //   hpMax: hp 
  // });
  const num = Math.floor(Math.random() * EN_TYPES);
  let mob;
  // const id = generateGUID();
  const [xPos, yPos] = [Math.floor(Math.random() * WORLD_SIZE) ,Math.floor(Math.random() * WORLD_SIZE)]
  switch (num) {
    case 1:
      mob = new Wolf("w_"+id, xPos, yPos)
      break;

    default:
      mob = new Bear("b_"+id, xPos, yPos)
      break;
  }

  // console.log(`Mob: ${JSON.stringify(mob)}`)
  enemies.push( mob )
}


io.on("connection", socket => {
  players[socket.id] = new ServerPlayer(
    socket.id,
    `Player_${socket.id.substring(0, 8)}`,
    Math.floor(Math.random() * WORLD_SIZE),
    Math.floor(Math.random() * WORLD_SIZE)
  );


  socket.on("playerJoin", (data) => {
    const p = players[socket.id];
    if (p && data.name) {
      p.name = data.name;
      console.log(`Player ${socket.id} joined as: ${p.name}`);
    }
  });

  // Save map from client editor
  socket.on("saveMap", (chunksData) => {
    if (!chunksData || typeof chunksData !== 'object') {
      console.warn('Invalid map data received');
      socket.emit('mapSaveResult', { success: false, message: 'Invalid data' });
      return;
    }
    
    try {
      // Log what we received
      console.log(`📥 Received map save request with ${Object.keys(chunksData).length} chunks`);
      // console.log(`  Sample chunk [0,0]: ${JSON.stringify(chunksData['0,0'])}`);
      
      // Ensure maps directory exists
      const mapsDir = path.join(process.cwd(), 'server', 'maps');
      if (!fs.existsSync(mapsDir)) {
        fs.mkdirSync(mapsDir, { recursive: true });
      }
      
      const mapPath = path.join(mapsDir, 'map.json');
      const mapJson = JSON.stringify(chunksData, null, 2);
      fs.writeFileSync(mapPath, mapJson, 'utf8');
      
      // Update server world with new chunks
      world.chunks = chunksData;
      console.log(`✓ Map saved and loaded: ${mapPath}`);
      // console.log(`  Sample chunk [0,0] after load: ${JSON.stringify(world.chunks['0,0'])}`);
      console.log(`  Total chunks: ${Object.keys(world.chunks).length}`);
      
      socket.emit('mapSaveResult', { success: true, message: 'Map saved successfully' });
    } catch (err) {
      console.error(`✗ Failed to save map: ${err.message}`);
      socket.emit('mapSaveResult', { success: false, message: err.message });
    }
  });


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

  socket.on('playerFacingDirection', (direction) => {
    const player = players[socket.id];
    if (player && direction && direction.x !== undefined && direction.y !== undefined) {
      player.setFacingDirection(direction);
    }
  });

  socket.on("harvestResource", resourceId => {
    const player = players[socket.id];
    console.log(`[HARVEST DEBUG] Player ${player?.name} trying to harvest resource: ${resourceId}`);
    if (!player) {
      console.log(`[HARVEST DEBUG] Player not found for socket ${socket.id}`);
      return;
    }

    // Find the resource (could be environment or enemy drop)
    const resourceIndex = resources.findIndex(r => r.id === resourceId);
    const dropIndex = enemyDrops.findIndex(d => d.id === resourceId);

    console.log(`[HARVEST DEBUG] Searching resources (total: ${resources.length}), drops (total: ${enemyDrops.length})`);
    console.log(`[HARVEST DEBUG] Found in resources: ${resourceIndex !== -1}, Found in drops: ${dropIndex !== -1}`);

        if (resourceIndex !== -1) {
      // Harvest from environment resource
      const resource = resources[resourceIndex];
      console.log(`[HARVEST DEBUG] Resource found: type=${resource.type}, canHarvest=${typeof resource.canHarvest}, isDeplete=${resource.isDeplete}`);
      
      if (resource.canHarvest && typeof resource.canHarvest === 'function') {
        const harvested = resource.harvestResources();
        console.log(`[HARVEST DEBUG] Harvested result: ${JSON.stringify(harvested)}`);
        if (harvested) {
          // Add to player inventory
          for (const [itemType, amount] of Object.entries(harvested)) {
            if (itemType !== 'xpReward') {
              player.inventory.addResource(itemType, amount);
              console.log(`[HARVEST DEBUG] Added ${amount} ${itemType} to inventory`);
            } else {
              player.addXP(amount);
              console.log(`[HARVEST DEBUG] Added ${amount} XP`);
            }
          }
          console.log(`${player.name} harvested: ${JSON.stringify(harvested)}`);
        }
      } else {
        console.log(`[HARVEST DEBUG] Resource missing canHarvest method or not a function`);
      }
    } else if (dropIndex !== -1) {
      // Collect from enemy drop
      const drop = enemyDrops[dropIndex];
      console.log(`[HARVEST DEBUG] Drop found: type=${drop.type}, quantity=${drop.quantity}`);
      const collected = drop.collect();
      console.log(`[HARVEST DEBUG] Collected: ${collected}`);
      if (collected > 0) {
        player.inventory.addResource(drop.type, collected);
        player.addXP(drop.xpReward);
        console.log(`${player.name} collected: ${collected} ${drop.type}`);
        
        if (drop.isCollected) {
          enemyDrops.splice(dropIndex, 1);
        }
      }
    } else {
      console.log(`[HARVEST DEBUG] Resource ID not found in either resources or drops`);
      console.log(`[HARVEST DEBUG] First 3 resource IDs: ${resources.slice(0, 3).map(r => r.id).join(', ')}`);
      console.log(`[HARVEST DEBUG] First 3 drop IDs: ${enemyDrops.slice(0, 3).map(d => d.id).join(', ')}`);
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
      const baseDamage = player.stats.damage;
      console.log(player)
      const multiplier = data.weapon ? 2.5 : 1.0;
      const totalDamage = baseDamage * multiplier;

      hitEnemy.hp -= totalDamage;
      console.log(`Player hit ${hitEnemy.id} for ${totalDamage} dmg! (x:${player.x}/y:${player.y})`);

      // Remove enemy if dead
      if (hitEnemy.hp <= 0) {
        const index = enemies.indexOf(hitEnemy);
        enemies.splice(index, 1);

        // Generate resource drops from defeated enemy
        const drops = hitEnemy.getResourceDrops();
        enemyDrops.push(...drops);
        console.log(`Enemy ${hitEnemy.id} defeated! Generated ${drops.length} resource drops`);

        // Player gains experience
        player.addXP(hitEnemy.xpWorth)
      }

      io.emit('hitEffect', { x: hitX, y: hitY, type: 'combat' })
      return; // Stop here if we hit an enemy
    }

    // 3. Check for Resources (Gathering Logic)
    // If no enemy was hit, check if we clicked a resource
    const hitResource = resources.find(res =>
      getDistance(hitX, hitY, res.x, res.y) < 25
    );

    if (hitResource && hitResource.canHarvest && typeof hitResource.canHarvest === 'function') {
      console.log(`Gathering resource: ${hitResource.type}`);

      const harvested = hitResource.harvestResources();
      if (harvested) {
        // Add harvested items to player inventory
        for (const [itemType, amount] of Object.entries(harvested)) {
          if (itemType !== 'xpReward') {
            player.inventory.addResource(itemType, amount);
          } else {
            player.addXP(amount);
          }
        }
        console.log(`Player: ${player.id} - ${player.name} harvested: ${JSON.stringify(harvested)}`);
      }

      io.emit('hitEffect', { x: hitX, y: hitY, type: 'gather' })
    }
  });

  socket.on("disconnect", () => {
    // Remove player from the game when they disconnect
    delete players[socket.id];
  });
});


// Broadcast game state to all clients at 30 FPS
setInterval(() => {
  // =========================
  // UPDATE RESOURCES (RESPAWN)
  // =========================
  if (resources.length > 0) {
    // console.log(`[GAME LOOP] Updating ${resources.length} resources for respawn...`);
  }
  for (const resource of resources) {
    if (resource.updateRespawn) {
      resource.updateRespawn(1000 / 30); // ~33ms per frame at 30 FPS
    }
  }

  // Clean up collected enemy drops
  for (let i = enemyDrops.length - 1; i >= 0; i--) {
    if (enemyDrops[i].shouldDespawn()) {
      enemyDrops.splice(i, 1);
    }
  }

  // =========================
  // ENEMY AI & INTERACTIONS
  // =========================
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
    if (distance < huntRange && closestPlayer) {
      // Calculate new position
      const angle = Math.atan2(closestPlayer.y - enemy.y, closestPlayer.x - enemy.x);
      const newX = enemy.x + Math.cos(angle) * 2; // Enemy speed
      const newY = enemy.y + Math.sin(angle) * 2;

      // Check collision with closest player (20px collision radius: 10 for enemy + 10 for player)
      const collisionDistance = 20;
      const dx = newX - closestPlayer.x;
      const dy = newY - closestPlayer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Only move if no collision
      if (dist > collisionDistance) {
        enemy.x = newX;
        enemy.y = newY;
      }
      // Otherwise enemy stops (doesn't move)
    } else {
      // Random movement with same collision check
      if (!enemy.moveDirection || Math.random() < 0.01) {
        const angle = Math.random() * 2 * Math.PI;
        enemy.moveDirection = { x: Math.cos(angle), y: Math.sin(angle) };
      }
      const newX = enemy.x + enemy.moveDirection.x * 1;
      const newY = enemy.y + enemy.moveDirection.y * 1;

      // Check collision with all alive players
      let canMove = true;
      for (const p of alivePlayers) {
        const collisionDistance = 20; // 10px each
        const dx = newX - p.x;
        const dy = newY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= collisionDistance) {
          canMove = false;
          break;
        }
      }

      if (canMove) {
        enemy.x = newX;
        enemy.y = newY;
      }
    }

    // Keep enemy within world bounds
    enemy.x = Math.max(0, Math.min(WORLD_SIZE, enemy.x));
    enemy.y = Math.max(0, Math.min(WORLD_SIZE, enemy.y));


    // Check if player HP is reduced to 0 or below and remove player from the game
    if (closestPlayer && closestPlayer.hp <= 0) {
      console.log('collision')
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
    if (closestPlayer) {
      const dx = closestPlayer.x - enemy.x;
      const dy = closestPlayer.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const attackRange = 25; // Range at which enemy deals damage

      if (dist < attackRange) {
        // Attack once per second (every 30 frames at 30 FPS)
        if (!enemy.lastAttackTime) enemy.lastAttackTime = 0;
        
        const now = Date.now();
        if (now - enemy.lastAttackTime > 1000) { // 1 second cooldown
          closestPlayer.takeDamage(10); // Enemy damage per hita
          enemy.lastAttackTime = now;
          // console.log(`Enemy ${enemy.id} attacks player! ${(closestPlayer.name ?? closestPlayer.name) || closestPlayer.id } HP: ${closestPlayer.stats.hp} (x:${Math.floor(enemy.x)}/y:${Math.floor(enemy.y)})`);
        }
      }
    }
  }


  // Broadcast updated game state to all clients
  const statePlayers = Object.fromEntries(
    Object.entries(players).map(([id, p]) => [id, p.toClient()])
  );

  // Serialize resources and drops for client
  const serializedResources = resources.map(r => 
    r.toObject ? r.toObject() : r
  );
  const serializedDrops = enemyDrops.map(d => d.toObject());

  
  // DEBUG: Log resource counts
  if (resources.length > 0) {
    // console.log(`[STATE BROADCAST] Sending ${serializedResources.length} resources to clients (sample: ${serializedResources[0]?.type})`);
  }

  
  io.emit("state", { 
    players: statePlayers, 
    enemies, 
    world, 
    resources: serializedResources,
    enemyDrops: serializedDrops
  });

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
