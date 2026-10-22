import { Server as HttpServer } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import { LiveVehicleUpdate } from '../types.js'
import { simulationEngine } from '../services/simulationEngine.js'

// SignalR ASCII Record Separator character
const RECORD_SEPARATOR = '\x1e'

interface ClientConnection {
  ws: WebSocket
  isSignalR: boolean
  subscribedVehicleId?: string
}

export class FleetHub {
  private wss: WebSocketServer | null = null
  private clients: Set<ClientConnection> = new Set()

  public init(server: HttpServer): void {
    this.wss = new WebSocketServer({ noServer: true })

    // Upgrade handler for both /hubs/fleet and /ws
    server.on('upgrade', (request, socket, head) => {
      const url = new URL(request.url || '', `http://${request.headers.host}`)
      const pathname = url.pathname

      if (pathname.startsWith('/hubs/fleet') || pathname.startsWith('/ws')) {
        this.wss!.handleUpgrade(request, socket, head, (ws) => {
          this.wss!.emit('connection', ws, request)
        })
      }
    })

    this.wss.on('connection', (ws: WebSocket, request) => {
      const url = new URL(request.url || '', `http://${request.headers.host}`)
      const isSignalR = url.pathname.startsWith('/hubs/fleet')

      const client: ClientConnection = { ws, isSignalR }
      this.clients.add(client)

      console.log(`[FleetHub] 🔌 New client connected (SignalR: ${isSignalR}, Total: ${this.clients.size})`)

      ws.on('message', (data: string | Buffer) => {
        this.handleClientMessage(client, data.toString())
      })

      ws.on('close', () => {
        this.clients.delete(client)
        console.log(`[FleetHub] 🔌 Client disconnected (Remaining: ${this.clients.size})`)
      })

      ws.on('error', (err) => {
        console.warn('[FleetHub] Socket error:', err.message)
        this.clients.delete(client)
      })

      // Send immediate full snapshot of all vehicles on initial connect
      const initialSnapshot = simulationEngine.getAllVehicles()
      if (isSignalR) {
        this.sendSignalRMessage(ws, 'ReceiveInitialFleet', [initialSnapshot])
      } else {
        this.sendJsonMessage(ws, 'INITIAL_FLEET', initialSnapshot)
      }
    })

    // Listen to SimulationEngine events and broadcast to all connected clients
    simulationEngine.on('vehicleUpdate', (update: LiveVehicleUpdate) => {
      this.broadcastVehicleUpdate(update)
    })

    simulationEngine.on('bulkUpdate', (updates: LiveVehicleUpdate[]) => {
      this.broadcastBulkUpdate(updates)
    })

    // Heartbeat ping every 15s to keep connections alive
    setInterval(() => {
      for (const client of this.clients) {
        if (client.ws.readyState === WebSocket.OPEN) {
          if (client.isSignalR) {
            client.ws.send(`{"type":6}${RECORD_SEPARATOR}`)
          } else {
            client.ws.ping()
          }
        }
      }
    }, 15000)
  }

  private handleClientMessage(client: ClientConnection, raw: string): void {
    if (client.isSignalR) {
      // SignalR messages can be separated by RECORD_SEPARATOR
      const messages = raw.split(RECORD_SEPARATOR).filter(m => m.trim().length > 0)
      for (const msg of messages) {
        try {
          const parsed = JSON.parse(msg)
          // Handshake request
          if (parsed.protocol === 'json') {
            client.ws.send(`{}${RECORD_SEPARATOR}`) // Handshake response
            continue
          }
          // SignalR Invocation
          if (parsed.type === 1 && parsed.target) {
            this.handleSignalRInvocation(client, parsed.target, parsed.arguments || [])
          }
        } catch {
          // Ignore invalid message
        }
      }
    } else {
      try {
        const parsed = JSON.parse(raw)
        if (parsed.action === 'SUBSCRIBE_VEHICLE') {
          client.subscribedVehicleId = parsed.vehicleId
        } else if (parsed.action === 'UNSUBSCRIBE_VEHICLE') {
          client.subscribedVehicleId = undefined
        }
      } catch {
        // Ignore
      }
    }
  }

  private handleSignalRInvocation(client: ClientConnection, target: string, args: any[]): void {
    if (target === 'SubscribeToVehicle') {
      client.subscribedVehicleId = args[0]
      console.log(`[FleetHub] Client subscribed to vehicle: ${args[0]}`)
    } else if (target === 'UnsubscribeFromVehicle') {
      client.subscribedVehicleId = undefined
      console.log('[FleetHub] Client unsubscribed from vehicle')
    }
  }

  public broadcastVehicleUpdate(update: LiveVehicleUpdate): void {
    for (const client of this.clients) {
      if (client.ws.readyState !== WebSocket.OPEN) continue

      if (client.isSignalR) {
        this.sendSignalRMessage(client.ws, 'ReceiveVehicleUpdate', [update])
      } else {
        this.sendJsonMessage(client.ws, 'VEHICLE_UPDATE', update)
      }
    }
  }

  public broadcastBulkUpdate(updates: LiveVehicleUpdate[]): void {
    for (const client of this.clients) {
      if (client.ws.readyState !== WebSocket.OPEN) continue

      if (client.isSignalR) {
        this.sendSignalRMessage(client.ws, 'ReceiveBulkUpdate', [updates])
      } else {
        this.sendJsonMessage(client.ws, 'BULK_UPDATE', updates)
      }
    }
  }

  private sendSignalRMessage(ws: WebSocket, target: string, args: any[]): void {
    const payload = JSON.stringify({ type: 1, target, arguments: args }) + RECORD_SEPARATOR
    ws.send(payload)
  }

  private sendJsonMessage(ws: WebSocket, type: string, data: any): void {
    ws.send(JSON.stringify({ type, data }))
  }
}

export const fleetHub = new FleetHub()
