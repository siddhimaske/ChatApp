const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users
let users = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle new user joining with name and avatar
  socket.on('new-user', ({ name, avatar }) => {
    users[socket.id] = { name, avatar };
    io.emit('user-list', Object.values(users));
    console.log('User list updated:', users);
  });

  // Handle chat message
  socket.on('chat-message', (data) => {
    const user = users[socket.id];
    if (user) {
      // Broadcast message only to the intended recipient and sender
      const recipientSocketId = Object.keys(users).find(
        (key) => users[key].name === data.to
      );
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('chat-message', {
          user: user.name,
          avatar: user.avatar,
          message: data.message,
          time: new Date().toLocaleTimeString(),
        });
      }
      // Also send to sender
      socket.emit('chat-message', {
        user: user.name,
        avatar: user.avatar,
        message: data.message,
        time: new Date().toLocaleTimeString(),
      });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const user = users[socket.id];
    if (user) {
      const recipientSocketId = Object.keys(users).find(
        (key) => users[key].name === data.to
      );
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing', {
          user: user.name,
        });
      }
    }
  });

  socket.on('stop-typing', (data) => {
    const user = users[socket.id];
    if (user) {
      const recipientSocketId = Object.keys(users).find(
        (key) => users[key].name === data.to
      );
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('stop-typing', {
          user: user.name,
        });
      }
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete users[socket.id];
    io.emit('user-list', Object.values(users));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
