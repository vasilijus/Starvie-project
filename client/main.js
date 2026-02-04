
const socket = io();

console.log('Client connected to server');

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Example of listening for messages from the server
socket.on('chat message', msg => {
  console.log('Received message from server: ' + msg);
});
// socket.emit('chat message', "Test2") // Example of emitting a message to the server

socket.on('p data', msg => {
  console.log('Received player data from server: ' + msg);
});
// Example of requesting player data from the server
// socket.emit('p data', "{socket.id}") // Replace {socket.id} with actual socket ID if needed")
