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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/match', require('./routes/match'));

async function getGeminiPrompt(proficiencyLevel) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Suggest one short conversation topic for a language exchange session. The learner's level is ${proficiencyLevel}. Give only the topic in one sentence, no explanation, no bullet points.` }] }]
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Tell your partner about your favourite hobby.';
  } catch {
    return 'Tell your partner about your favourite hobby.';
  }
}

const waitingUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('find_match', async ({ userId, nativeLanguage, targetLanguage, proficiencyLevel }) => {
    const key = `${targetLanguage}-${nativeLanguage}`;
    const myKey = `${nativeLanguage}-${targetLanguage}`;

    if (waitingUsers[key]) {
      const partner = waitingUsers[key];
      delete waitingUsers[key];
      const room = `room-${socket.id}-${partner.id}`;
      socket.join(room);
      partner.join(room);
      io.to(room).emit('matched', { room });
      const prompt = await getGeminiPrompt(proficiencyLevel || 'intermediate');
      io.to(room).emit('session_prompt', { prompt });
    } else {
      waitingUsers[myKey] = socket;
    }
  });

  // Broadcast the message with the original sender's socket id, so every
  // connected client (including the sender) can tell who sent it.
  socket.on('send_message', ({ room, message, senderId }) => {
    io.to(room).emit('receive_message', { message, senderId, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    for (const key in waitingUsers) {
      if (waitingUsers[key].id === socket.id) delete waitingUsers[key];
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
