// Ensure the old socket file is cleaned up before starting
const socketPath = "/tmp/math.sock";
try { await Deno.remove(socketPath); } catch {}

const listener = Deno.listen({ transport: "unix", path: socketPath });
console.log(`🦕 Deno math engine listening on ${socketPath}`);

for await (const conn of listener) {
  handleConnection(conn);
}

async function handleConnection(conn: Deno.Conn) {
  const buffer = new Uint8Array(1024);
  
  try {
    while (true) {
      const bytesRead = await conn.read(buffer);
      if (bytesRead === null) break; // Client disconnected

      const message = new TextDecoder().decode(buffer.subarray(0, bytesRead)).trim();
      console.log(`Received payload: "${message}"`);

      // Simple processing logic (parsing "5+5")
      const [num1, num2] = message.split("+").map(Number);
      const result = !isNaN(num1) && !isNaN(num2) ? num1 + num2 : "Error: Invalid Math";

      // Write response back down the socket pipeline
      await conn.write(new TextEncoder().encode(`${result}\n`));
    }
  } catch (err) {
    console.error("Socket connection error:", err);
  } finally {
    conn.close();
  }
}

