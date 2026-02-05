import { Player } from "./modules/Player.js";
import { WorldRenderer } from "./modules/WorldRenderer.js";
import Network from "./modules/Network.js";
import InputHandler from "./modules/InputHandler.js";
import Renderer from "./modules/Renderer.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const network = new Network();
console.log("Network initialized with ID:", network);

const player = new Player(`Player_${network.id}`);
const worldRenderer = new WorldRenderer();

const renderer = new Renderer(canvas, ctx, player, worldRenderer);
console.log("Renderer initialized with player:", player);
console.log("WorldRenderer initialized:", worldRenderer);
console.log("InputHandler initialized with canvas", canvas);
const input = new InputHandler(canvas, player, network);

// receive authoritative state and hand to renderer
network.on('state', data => {
  const { players, enemies, worldSize, resources } = data;
  if (players[network.id]) {
    player.x = players[network.id].x;
    player.y = players[network.id].y;
  }
  renderer.render(data);
});

function loop() {
  player.update();
  requestAnimationFrame(loop);
}
loop();
