import { Player } from "./modules/Player.js";
import { World } from "./modules/World.js";

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
const world = new World();
// world.addPlayer(player);
const enemies = [
  // Example enemy data
  // { id: "enemy1", x: 500, y: 500, hp: 50 },
  // { id: "enemy2", x: 1500, y: 1500, hp: 75 }
];

const keys = {};

window.addEventListener("keydown", e => {
  keys[e.key] = true;
});

window.addEventListener("keyup", e => {
  keys[e.key] = false; // delete keys[e.key];
});

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

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

socket.on('state', players => {

  player.update();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  world.draw(ctx, player);

  // Draw players
  for(const id in players) {
    const p = players[id];
    ctx.fillStyle = id === myId ? 'blue' : 'red'; // Highlight own player in blue
    console.log(`Player ${id}: x=${p.x}, y=${p.y}, hp=${p.hp}`); // Debug log for player positions and health
    // Draw square
    // ctx.fillRect(p.x, p.y, 50, 50);
    ctx.fillRect(p.x - player.x + canvas.width/2, p.y - player.y + canvas.height/2, 20, 20);
    // Draw circle
    const posX = p.x - player.x + canvas.width/2;
    const posY = p.y - player.y + canvas.height/2;
    // drawPerson(ctx, posX, posY, p.hp);
  }
  // players.forEach(player => {
  //   const p = players.find(p => p.id === player.id);
  //   ctx.fillStyle = p.color;
  //   ctx.fillRect(p.x, p.y, p.size, p.size);
  //   // ctx.fillRect(player.x, player.y, player.size, player.size);
  // });


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
  ctx.fillRect(x - 15, y - 20, (hp / 100) * 30, 5);
}