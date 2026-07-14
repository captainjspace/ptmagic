import net from 'node:net';

const socketPath = '/tmp/math.sock';

// Connect to the Deno socket file
const client = net.createConnection(socketPath, () => {
  console.log('🟢 Node.js app connected to Deno socket.');
  
  // Send a calculation string over the pipe
  client.write('40+2');
});

// Listen for the mathematical response
client.on('data', (data) => {
  console.log(`📥 Result from Deno: ${data.toString().trim()}`);
  client.end(); // Close the connection nicely
});

client.on('end', () => {
  console.log('🛑 Disconnected from math engine.');
});

client.on('error', (err) => {
  console.error('❌ Socket Connection Failed:', err.message);
});

