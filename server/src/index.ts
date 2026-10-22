import http from 'http'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { apiReference } from '@scalar/express-api-reference'
import { apiRouter, handleSignalRNegotiate } from './controllers/vehiclesController.js'
import { initDatabase } from './db/mysql.js'
import { openApiSpec } from './docs/openapi.js'
import { fleetHub } from './hubs/fleetHub.js'
import { simulationEngine } from './services/simulationEngine.js'

dotenv.config()

const app = express()
const server = http.createServer(app)

const PORT = Number(process.env.PORT) || 5000
const SIMULATION_INTERVAL_MS = Number(process.env.SIMULATION_INTERVAL_MS) || 1500

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(express.json())

// ── SignalR Negotiate Handlers ────────────────────────────────────────────────
app.post('/hubs/fleet/negotiate', handleSignalRNegotiate)
app.get('/hubs/fleet/negotiate', handleSignalRNegotiate)

// ── REST API Routes ───────────────────────────────────────────────────────────
app.use('/api', apiRouter)

// ── OpenAPI Specification & Scalar Reference ──────────────────────────────────
app.get('/openapi.json', (_req, res) => {
  res.json(openApiSpec)
})

app.use(
  '/scalar',
  apiReference({
    spec: {
      content: openApiSpec,
    },
    theme: 'kepler',
    darkMode: true,
  })
)

app.get('/docs', (_req, res) => res.redirect('/scalar'))

app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Fleet Telematics Server</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #0b1120; color: #f8fafc; display: grid; place-items: center; min-height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 2.5rem; border-radius: 16px; border: 1px solid #334155; text-align: center; max-width: 520px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        h1 { color: #22c55e; margin-bottom: 0.5rem; font-size: 1.8rem; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
        .links { display: flex; gap: 12px; justify-content: center; margin-top: 1.5rem; }
        a { background: #22c55e; color: #0b1120; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; transition: transform 0.15s; }
        a:hover { transform: translateY(-2px); }
        .badge { display: inline-block; padding: 4px 12px; background: rgba(34, 197, 94, 0.15); color: #4ade80; border-radius: 20px; font-size: 0.8rem; margin-bottom: 1rem; border: 1px solid rgba(74, 222, 128, 0.3); }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">● Server Active & Broadcasting</span>
        <h1>Fleet GPS Simulation Server</h1>
        <p>Real-time vehicle movement engine emitting sequential Riyadh coordinates via SignalR, WebSocket, and REST API.</p>
        <div class="links">
          <a href="/scalar" target="_blank">📖 Open Scalar API Docs</a>
          <a href="/api/vehicles" target="_blank" style="background: #334155; color: #f8fafc;">🚗 Test GET Vehicles</a>
        </div>
      </div>
    </body>
    </html>
  `)
})

// ── Startup ───────────────────────────────────────────────────────────────────
async function bootstrap() {
  // 1. Initialize SignalR / WebSocket Hub
  fleetHub.init(server)

  // 2. Initialize MySQL Database (optional fallback to in-memory)
  await initDatabase()

  // 3. Start Simulation Engine
  simulationEngine.start(SIMULATION_INTERVAL_MS)

  // 4. Start Server Listening
  server.listen(PORT, () => {
    console.log(`\n==================================================================`)
    console.log(`  🚀 Fleet Telematics & GPS Simulation Server Running on Port ${PORT}`)
    console.log(`  📖 Scalar API Docs:   http://localhost:${PORT}/scalar`)
    console.log(`  🚗 REST API Endpoint: http://localhost:${PORT}/api/vehicles`)
    console.log(`  🔌 SignalR Hub:       ws://localhost:${PORT}/hubs/fleet`)
    console.log(`  ⚡ Raw WebSocket:     ws://localhost:${PORT}/ws`)
    console.log(`==================================================================\n`)
  })
}

bootstrap().catch(err => {
  console.error('[Bootstrap] Fatal startup error:', err)
})
