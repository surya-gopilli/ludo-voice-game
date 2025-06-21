const io = require('socket.io')(process.env.PORT || 3000, {
  cors: { origin: '*' }
});
io.on('connection', socket => {
  console.log('User connected:', socket.id);
  socket.on('rollDice', val => socket.broadcast.emit('diceRolled', val));
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});
console.log('Socket.io server running');
