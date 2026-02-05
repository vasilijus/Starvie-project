import { Player } from "./modules/Player.js";
// import { World } from "./modules/World.js";
import { WorldRenderer } from "./modules/WorldRenderer.js";

const socket = io();
let myId = null;
socket.on('connect', () => {
  myId = socket.id;
  console.log(`Connected to server with ID: ${myId}`);
});

console.log('Client connected to server');
console.log(socket.id); // Log the socket ID

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// const player = new Player("Player", socket.id);
const player = new Player("Player");
// const world = new World();
const worldRenderer = new WorldRenderer();
// world.addPlayer(player);
const enemies = [
  // Example enemy data
  // { id: "enemy1", x: 500, y: 500, hp: 50 },
  // { id: "enemy2", x: 1500, y: 1500, hp: 75 }
];

const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);
addEventListener("click", e => {
  // 1. Calculate the target point in the world based on the click
  const clickX = player.x - canvas.width / 2 + e.clientX;
  const clickY = player.y - canvas.height / 2 + e.clientY;

  // 2. Calculate the direction vector from the player to the click
  const dirX = clickX - player.x;
  const dirY = clickY - player.y;
  const length = Math.sqrt(dirX * dirX + dirY * dirY);
  if (length === 0) return; // Avoid division by zero
  
  // 3. Normalise the direction (so it's a value between -1 and 1)
  const normDir = {
    x: dirX / length,
    y: dirY / length
  };

  // 4. Determine action based on equipment (Assuming player.equipment exists)
  // You can expand this logic as you add more items
  const currentEquipment = player.equipment || 'none'; 
  const actionType = (currentEquipment === 'sword' || currentEquipment === 'axe') 
    ? 'attack' 
    : 'interact';

  // 5. Emit the action to the server
  socket.emit('playerAction', {
    type: actionType,
    direction: normDir,
    item: currentEquipment
  });

  console.log(`Action Sent: ${actionType} using ${currentEquipment}`);
});



ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);


socket.on('state', data => {
  const { players, enemies: enemyData, worldSize, resources } = data;

  if (players[myId]) {
    player.x = players[myId].x;
    player.y = players[myId].y;
    // player.hp = players[myId].hp;
  }

  player.update();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // world.draw(ctx, player);
  worldRenderer.draw(ctx, data.world, player);

  // Draw players
  for(const id in players) {
    const p = players[id];
    ctx.fillStyle = id === myId ? 'blue' : 'red'; // Highlight own player in blue
    // console.log(`Player ${id}: x=${p.x}, y=${p.y}, hp=${p.hp}`); // Debug log for player positions and health
    // Draw square
    // ctx.fillRect(p.x, p.y, 50, 50);
    ctx.fillRect(p.x - player.x + canvas.width/2, p.y - player.y + canvas.height/2, 20, 20);
    // Draw circle
    const posX = p.x - player.x + canvas.width/2;
    const posY = p.y - player.y + canvas.height/2;
    // drawPerson(ctx, posX, posY, p.hp);
    drawPersonHealthBar(ctx, posX, posY, p.hp);
  }

  // Draw enemies
  for(const enemy of enemyData) {
    const sx = enemy.x - player.x + canvas.width/2;
    const sy = enemy.y - player.y + canvas.height/2;
    // console.log(`Enemy ${enemy.id}: x=${enemy.x}, y=${enemy.y}, hp=${enemy.hp}`); // Debug log for enemy positions and health 
    ctx.fillStyle = 'grey';
    ctx.fillRect(sx, sy, 20, 20);
    // drawPerson(ctx, enemy.x - player.x + canvas.width/2, enemy.y - player.y + canvas.height/2, enemy.hp);
    drawPersonHealthBar(ctx, sx, sy, enemy.hp);
  }

  // Draw resources
  console.log(`Resources: ${resources.length}`); // Debug log for number of resources
  for(const resource of resources) {
    // console.log(`Resource ${JSON.stringify(resourcea)}`); // Debug log for resource details
    const sx = resource.x - player.x + canvas.width/2;
    const sy = resource.y - player.y + canvas.height/2;
    ctx.fillStyle = resource.icon_color || 'green';
    ctx.fillRect(sx, sy, 10, 10);
    // Optionally, draw resource type or HP if needed
  }

});

function update() {
  let direction = { x: 0, y: 0 };

  if (keys['w']) direction.y += -1;
  if (keys['s']) direction.y += 1;
  if (keys['a']) direction.x += -1;
  if (keys['d']) direction.x += 1;

  // Example of sending player input to the server
  socket.emit('playerInput', direction);

  requestAnimationFrame(update);
}
update();


function drawPerson(ctx, x, y, hp) {
  ctx.beginPath();
  // Draw head
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  // Draw body shape
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 20);
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x - 10, y + 20);
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x + 10, y + 20);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Draw health bar
  drawPersonHealthBar(ctx, x, y, hp); // Example health value, replace with actual player HP if available
}

function drawPersonHealthBar(ctx, x, y, hp) {
  ctx.fillStyle = 'green';
  ctx.fillRect(x - 5, y - 20, (hp / 100) * 30, 5);
}



// Example of listening for messages from the server
socket.on('chat message', msg => {
  console.log('Received message from server: ' + msg);
});
// socket.emit('chat message', "Test2") // Example of emitting a message to the server

socket.on('privateData', msg => {
  console.log('Received player data from server: ' + msg);
});
// Example of requesting player data from the server
// socket.emit('p data', "{socket.id}") // Replace {socket.id} with actual socket ID if needed")
