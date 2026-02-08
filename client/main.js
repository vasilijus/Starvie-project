import { ClientPlayer } from "./modules/ClientPlayer.js";
import { WorldRenderer } from "./modules/WorldRenderer.js";
import Network from "./modules/Network.js";
import InputHandler from "./modules/InputHandler.js";
import Renderer from "./modules/Renderer.js";
import { MapEditor } from "./modules/MapEditor.js";
import StatusPanel from "./modules/StatusPanel.js";
// In your main game file:
import CraftingPanel from './modules/CraftingPanel.js';
import CraftingRules from './modules/CraftingRules.js';


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let lastState = undefined;



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

  landing.classList.add('hidden');

  const player = new ClientPlayer(playerID, playerName);
  player.activeEffects = [];

  network.on('hitEffect', (effectData) => {
      player.activeEffects.push({
          x: effectData.x,
          y: effectData.y,
          life: 1.0,
          decay: 0.05,
          type: effectData.type
      });
  });

  network.emit('playerJoin', { name: playerName });

  const worldRenderer = new WorldRenderer();
  const mapEditor = new MapEditor(canvas, ctx, player, worldRenderer, network);

    // In setup/constructor:
const craftingRules = new CraftingRules();
const craftingPanel = new CraftingPanel({ x: 250, y: 10 });
craftingPanel.setRules(craftingRules);

  const renderer = new Renderer(canvas, ctx, player, worldRenderer, mapEditor, craftingPanel);
  const input = new InputHandler(canvas, player, network, mapEditor, craftingPanel);

  // Status panel (inventory + hotbar)
  const statusPanel = new StatusPanel({ x: 10, y: 10, width: 220, height: 160 });


// Add keyboard listener for 'C':
// window.addEventListener('keydown', (e) => {
//     if (e.key.toLowerCase() === 'c') {
//         craftingPanel.toggle();
//     }
// });


  let worldInitialized = false;

  network.on('state', data => {
    const { players } = data;
    if (!worldInitialized) {
      mapEditor.setWorld(data.world);
      worldInitialized = true;
    } else if (!mapEditor.isActive) {
      mapEditor.setWorld(data.world);
    }
    if (players[network.id]) {
      player.syncFromServer(players[network.id]);
    }

    // store last state for input detection & rendering
    input.lastState = data;
    lastState = data;
    // render immediately for lower perceived latency
    renderer.render(data);
    // draw status panel overlay immediately
    statusPanel.draw(ctx, player);
  });

  function loop() {
    player.update();
    if (typeof lastState !== 'undefined') {
      renderer.render(lastState);
      statusPanel.draw(ctx, player);
    }
    requestAnimationFrame(loop);
  }
  loop();
});


// Allow Enter key to trigger play
playerNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !playBtn.disabled) {
    playBtn.click();
  }
});

// addEventListener()
