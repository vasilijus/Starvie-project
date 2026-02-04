
import express from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware setup (commented out for now)
// app.use(bodyParser.json());
app.use(express.static('../client'));
// app.use(cors());
// app.use(morgan('dev'));

// In-memory storage for players (example)
const players = {};

//  Routes to client/test.html
app.get('/test', (req, res) => {
  res.sendFile('test.html', { root: '../client' });
});

io.on('connection', socket => {
  players[socket.id] = { 
    x: Math.random() * 100, y: Math.random() * 100, 
    hp: 100 , score: 0, name: `Player_${socket.id.substring(0, 6)}`, 
    color: '#' + Math.floor(Math.random()*16777215).toString(16) ,
    id: socket.id 
  };
  console.log(`Server: a user connected (${socket.id})`);
  console.log(players[socket.id]);
    
  socket.on('chat message', msg => {
      console.log('message: ' + msg);
      io.emit('chat message', msg);
  });
  // Example of handling player data request from client
  // Client can request its player details using its socket ID
  // io().emit('p data', "ELSgrgyMd7Rz5ybMAAAL") 
  socket.on('p data', msg => {
      console.log('message: ' + JSON.stringify(players[msg]));
      io.emit('p data', JSON.stringify(players[msg]));
  });

  socket.on('disconnect', () => {
      console.log('Server: user disconnected');
  });
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server: Running on port ${PORT}`);
});
