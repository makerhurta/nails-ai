import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Pool } from 'pg';

// 1) Pripojenie k Postgresu (lokálny Docker)
const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@localhost:5432/nails',
});

// 2) Štart servera: všetky routes musia byť VO VNÚTRI tejto funkcie,
//    aby mali prístup k premennej `server`.
async function start() {
  const server = Fastify();

  // CORS pre volania z frontendu (localhost:5173)
  await server.register(cors, { origin: true });

  // GET /health – základný check
  server.get('/health', async () => ({ status: 'OK' }));

  // GET /time – demo dynamických dát
  server.get('/time', async () => ({ now: new Date().toISOString() }));

  // POST /echo – prijme JSON { text } a vráti { echo }
  server.post('/echo', async (request, reply) => {
    const body = request.body as { text?: string };

    if (!body?.text) {
      reply.code(400);
      return { error: "Missing 'text' in body" };
    }

    return { echo: body.text };
  });

  // GET /db-test – jednoduchý dotaz do Postgresu
  server.get('/db-test', async () => {
    const result = await pool.query('SELECT NOW()');
    return { now: result.rows[0].now };
  });

  // GET /notes – vráti posledných 20 poznámok (najnovšie hore)
  server.get('/notes', async () => {
    const result = await pool.query<{
      id: string;
      text: string;
      created_at: string;
    }>(
      `SELECT id, text, created_at
     FROM notes
     ORDER BY created_at DESC
     LIMIT 20`,
    );

    return { notes: result.rows };
  });

  // POST /notes – prijme JSON { text } a uloží do DB
  server.post('/notes', async (request, reply) => {
    const body = request.body as { text?: string };

    const text = (body?.text ?? '').trim();
    if (!text) {
      reply.code(400);
      return { error: "Missing 'text' in body" };
    }

    // parameterized query → bezpečné proti SQL injection
    const insert = await pool.query<{
      id: string;
      text: string;
      created_at: string;
    }>(
      `INSERT INTO notes (text)
     VALUES ($1)
     RETURNING id, text, created_at`,
      [text],
    );

    reply.code(201);
    return { note: insert.rows[0] };
  });

  // Spustenie servera
  server.listen({ port: 3001 }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`🚀 Server beží na ${address}`);
  });
}

// 3) Spusť štart a zachyť prípadné chyby
start().catch((e) => {
  console.error('Server start failed:', e);
  process.exit(1);
});
