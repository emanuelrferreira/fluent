const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/match', require('./routes/match'));

// Socket.io — real-time chat
const waitingUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('find_match', ({ userId, nativeLanguage, targetLanguage }) => {
    const key = `${targetLanguage}-${nativeLanguage}`;
    if (waitingUsers[key]) {
      const partner = waitingUsers[key];
      delete waitingUsers[key];
      const room = `${socket.id}-${partner.id}`;
      socket.join(room);
      partner.join(room);
      io.to(room).emit('matched', { room });
    } else {
      waitingUsers[`${nativeLanguage}-${targetLanguage}`] = socket;
    }
  });

  socket.on('send_message', ({ room, message, sender }) => {
    io.to(room).emit('receive_message', { message, sender, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
