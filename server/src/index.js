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

// app.use(express.static('../client'));

// 1. Main site at '/' (loads files from '../client')
app.use('/', express.static('../client'));

// 2. Admin dashboard at '/admin' (loads files from '../admin-client')
// Files in '../admin-client' will be accessible via http://localhost:3001/admin/
// app.use('/admin', express.static('../admin-client'));

// 2. Admin dashboard at '/admin' (loads files from '../admin-client')
// Files in '../admin-client' will be accessible via http://localhost:3001/admin/
app.use('/re', express.static('../client/resource-editor.html'));

// app.use('/test', (req, res) => {
//   res.send('GET request to the homepage')
// });

app.use('/test', (req, res) => {
  res.send('GET request to the homepage')
});

const state = createGameState();

registerSocketHandlers(io, state);
startGameLoop(io, state);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
