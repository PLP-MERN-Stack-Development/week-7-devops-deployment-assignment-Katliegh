// server/index.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// === SENTRY SETUP ===
Sentry.init({
  dsn: process.env.SENTRY_DSN, // Add your Sentry DSN to .env
  tracesSampleRate: 1.0,
});
app.use(Sentry.Handlers.requestHandler()); // Log incoming requests

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Log all HTTP requests

const io = new Server(server, {
  cors: {
    origin: '*', // Change to your frontend URL in production
    methods: ['GET', 'POST'],
  },
});

// === HEALTH CHECK ROUTE ===
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// === BASIC ROOT ROUTE ===
app.get('/', (req, res) => {
  res.send('Server is running');
});

// === SOCKET.IO HANDLERS ===
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('message', (msg) => {
    console.log('Received message:', msg);
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// === SENTRY ERROR HANDLER ===
app.use(Sentry.Handlers.errorHandler());

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
