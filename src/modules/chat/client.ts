import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // WebSocket 서버 주소

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server:', socket.id);

  // 서버에 메시지 전송
  socket.emit('test', { message: 'Hello, WebSocket!' });
});

socket.on('receiveMessage', (data) => {
  console.log('📩 New message received:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket server');
});
