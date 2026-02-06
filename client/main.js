import { Player } from "./modules/Player.js";
import { WorldRenderer } from "./modules/WorldRenderer.js";
import Network from "./modules/Network.js";
import InputHandler from "./modules/InputHandler.js";
import Renderer from "./modules/Renderer.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;



// Landing page elements
const landing = document.getElementById("landing");
const socketIdSpan = document.getElementById("socketId");
const playerNameInput = document.getElementById("playerName");
const playBtn = document.getElementById("playBtn");

// Initialize network
const network = new Network();
// console.log("Network initialized with ID:", network);
// const player = new Player(`Player_${network.id}`);


// Wait for socket connection
network.on('connect', () => {
  // console.log("Socket connected:", network.id);
  socketIdSpan.textContent = network.id;
  playBtn.disabled = false; // Enable play button once connected
});

// Play button handler
let gameStarted = false;
playBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim() || `Player_${network.id.substring(0, 8)}`;
  const playerID = document.getElementById('socketId').textContent

  console.log("Starting game with player name:", playerName);

  // Hide landing page
  landing.classList.add('hidden');

  // Initialize player with entered name
  const player = new Player(playerID, playerName);

  player.activeEffects = []; // Initialize once here!

  network.on('hitEffect', (effectData) => {
      // REMOVE THIS LINE: player.activeEffects = [] 
      // console.log('Hit effect added at:', effectData.x, effectData.y);
      player.activeEffects.push({
          x: effectData.x,
          y: effectData.y,
          life: 1.0, 
          decay: 0.05, // Controls how fast it vanishes
          type: effectData.type
      });
  });

  // Send player name to server
  network.emit('playerJoin', { name: playerName });


  // Initialize game components
  const worldRenderer = new WorldRenderer();

  const renderer = new Renderer(canvas, ctx, player, worldRenderer);

  const input = new InputHandler(canvas, player, network);

  console.log("Renderer initialized with player:", player);
  console.log("InputHandler initialized with canvas", canvas);
    
  // Receive authoritative state and hand to renderer
  network.on('state', data => {
    const { players, enemies, worldSize, resources } = data;
    if (players[network.id]) {
      player.x = players[network.id].x;
      player.y = players[network.id].y;
    }
    renderer.render(data);
  });

  // Game loop
  function loop() {
    player.update();
    requestAnimationFrame(loop);
  }
  gameStarted = true;
  loop();
});


// Allow Enter key to trigger play
playerNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !playBtn.disabled) {
    playBtn.click();
  }
});

// addEventListener()
