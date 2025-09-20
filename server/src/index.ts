import Fastify from "fastify";
import cors from "@fastify/cors";

async function start() {
  const server = Fastify();

  // CORS pre volania z frontendu (localhost:5173)
  await server.register(cors, { origin: true });

  // Zdravotný check
  server.get("/health", async () => ({ status: "OK" }));

  // Server time
  server.get("/time", async () => ({ now: new Date().toISOString() }));
  
  // POST /echo – prijme JSON { text: string } a vráti { echo: string }
  server.post("/echo", async (request, reply) => {
    // Fastify vie JSON parsovať automaticky
    const body = request.body as { text?: string };

    if (!body?.text) {
      reply.code(400);
      return { error: "Missing 'text' in body" };
    }

  return { echo: body.text };
});
  server.listen({ port: 3001 }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`🚀 Server beží na ${address}`);
  });
}

start().catch((e) => {
  console.error("Server start failed:", e);
  process.exit(1);
});