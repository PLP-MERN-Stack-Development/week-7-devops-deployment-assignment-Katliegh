// server/index.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // For development, allow all origins. Change in production.
    methods: ['GET', 'POST'],
  },
});

// Basic route to check server status
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Example event handler
  socket.on('message', (msg) => {
    console.log('Received message:', msg);
    // Broadcast message to all connected clients
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
