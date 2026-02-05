
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { generateWorld, WORLD_CHUNKS, CHUNK_SIZE, TILE_SIZE } from "./map/ProceduralMap.js";

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
  players[socket.id] = { 
    // Spawn players at random positions within the world
    x: Math.floor(Math.random() * WORLD_SIZE),
    y: Math.floor(Math.random() * WORLD_SIZE), 
    hp: 100 
  };

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
      closestPlayer.hp -= 1; // Reduce player HP
      enemy.hp -= 1; // Reduce enemy HP
      if (enemy.hp <= 0) {
        enemies.splice(enemies.indexOf(enemy), 1); // Remove dead enemy
      }
    }


  }

  // Broadcast updated game state to all clients
  io.emit("state", { players, enemies, world });
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