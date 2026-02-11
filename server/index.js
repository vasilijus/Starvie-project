import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { createGameState } from './runtime/gameState.js';
import { loadMapFromFile } from './runtime/worldLoader.js';
import { registerSocketHandlers } from './runtime/socketHandlers.js';
import { startGameLoop } from './runtime/gameLoop.js';

// Attempt to load handmade map before world generation
loadMapFromFile();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('../client'));

const state = createGameState();

registerSocketHandlers(io, state);
startGameLoop(io, state);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
