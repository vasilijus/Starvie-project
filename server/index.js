
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("../client"));

const players = {};

io.on("connection", socket => {
  players[socket.id] = { x: 200, y: 200, hp: 100 };

  socket.on("playerInput", dir => {
    const p = players[socket.id];
    if (!p) return;
    p.x += dir.x * 5;
    p.y += dir.y * 5;
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });
});

setInterval(() => {
  io.emit("state", players);
}, 1000 / 30);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
