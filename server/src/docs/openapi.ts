export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Fleet Tracking & GPS Telematics API',
    version: '1.0.0',
    description: `
**Fleet Tracking & Real-Time GPS Simulation Engine**

This API provides full telematics management and real-time streaming of vehicle GPS coordinates along Riyadh roads:
- **REST Endpoints**: Query vehicles with group tree hierarchies, filter by status, type, zone, fuel, and drivers.
- **SignalR Hub**: \`/hubs/fleet\` for real-time bidirectional streaming of coordinates, speed, and heading.
- **WebSocket Stream**: \`/ws\` for raw JSON telemetry streams.
    `,
    contact: {
      name: 'Fleet Engineering Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Telematics Server',
    },
  ],
  paths: {
    '/api/vehicles': {
      get: {
        summary: 'Get all fleet vehicles with multi-criteria filtering',
        description: 'Returns list of fleet vehicles matching the provided filters. Matches all frontend filters 1-to-1.',
        tags: ['Vehicles'],
        parameters: [
          {
            name: 'search',
            in: 'query',
            description: 'Search string matching vehicle name, plate, or driver name',
            required: false,
            schema: { type: 'string', example: 'Marcus' },
          },
          {
            name: 'status',
            in: 'query',
            description: 'Filter by operational status (comma separated: moving, idle, offline)',
            required: false,
            schema: { type: 'string', example: 'moving' },
          },
          {
            name: 'type',
            in: 'query',
            description: 'Filter by vehicle type (truck, van, car, motorcycle)',
            required: false,
            schema: { type: 'string', example: 'truck' },
          },
          {
            name: 'groupId',
            in: 'query',
            description: 'Fleet group ID (e.g. riyadh, riyadh-central, riyadh-north)',
            required: false,
            schema: { type: 'string', example: 'riyadh-central' },
          },
          {
            name: 'includeSubgroups',
            in: 'query',
            description: 'If true, selecting a parent group (like "riyadh") includes all its descendant branches',
            required: false,
            schema: { type: 'boolean', default: true },
          },
          {
            name: 'zone',
            in: 'query',
            description: 'Zone filter (e.g. Central Riyadh, North Riyadh)',
            required: false,
            schema: { type: 'string', example: 'Central Riyadh' },
          },
          {
            name: 'minFuel',
            in: 'query',
            description: 'Filter vehicles with fuel level >= minFuel percentage (0-100)',
            required: false,
            schema: { type: 'number', example: 50 },
          },
          {
            name: 'driversOnly',
            in: 'query',
            description: 'Driver assignment filter: "all", "assigned", or "unassigned"',
            required: false,
            schema: { type: 'string', enum: ['all', 'assigned', 'unassigned'], default: 'all' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful vehicle list query',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 12 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Vehicle' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create and register a new vehicle',
        tags: ['Vehicles'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Fleet Test 99' },
                  plate: { type: 'string', example: 'CA-1234-Z' },
                  driver: { type: 'string', example: 'Sami Al-Harbi' },
                  vehicleType: { type: 'string', enum: ['truck', 'van', 'car', 'motorcycle'], example: 'truck' },
                  groupId: { type: 'string', example: 'riyadh-central' },
                  zone: { type: 'string', example: 'Central Riyadh' },
                  status: { type: 'string', enum: ['moving', 'idle', 'offline'], example: 'moving' },
                  speed: { type: 'number', example: 60 },
                  fuelLevel: { type: 'number', example: 85 },
                  lat: { type: 'number', example: 24.7136 },
                  lng: { type: 'number', example: 46.6753 },
                },
                required: ['name', 'plate', 'vehicleType'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Vehicle created successfully' },
        },
      },
    },
    '/api/vehicles/{id}': {
      get: {
        summary: 'Get vehicle by ID with full telemetry and sensors',
        description: 'Returns the full vehicle object, including telemetry (WASL, weight, camera), real-time sensors, route points, and raw device data.',
        tags: ['Vehicles'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Vehicle ID (e.g. v001, v002)',
            schema: { type: 'string', example: 'v001' },
          },
        ],
        responses: {
          '200': {
            description: 'Full vehicle details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Vehicle' },
                  },
                },
              },
            },
          },
          '404': { description: 'Vehicle not found' },
        },
      },
    },
    '/api/vehicles/{id}/status': {
      patch: {
        summary: 'Update vehicle operational status (for testing movement)',
        description: 'Toggles or sets vehicle status (e.g. moving vs idle). Moving vehicles immediately start emitting simulated GPS steps.',
        tags: ['Vehicles'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'v003' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['moving', 'idle', 'offline'], example: 'moving' },
                },
                required: ['status'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Status updated' },
        },
      },
    },
    '/api/groups': {
      get: {
        summary: 'Get fleet groups tree hierarchy',
        tags: ['Fleet Entities'],
        responses: {
          '200': { description: 'Fleet groups list' },
        },
      },
    },
    '/api/drivers': {
      get: {
        summary: 'Get fleet drivers directory',
        tags: ['Fleet Entities'],
        responses: {
          '200': { description: 'Drivers list' },
        },
      },
    },
    '/api/health': {
      get: {
        summary: 'Server health check',
        tags: ['System'],
        responses: {
          '200': { description: 'System healthy' },
        },
      },
    },
  },
  components: {
    schemas: {
      Vehicle: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'v001' },
          name: { type: 'string', example: 'Fleet Alpha 01' },
          plate: { type: 'string', example: 'CA-4821-X' },
          driver: { type: 'string', example: 'Marcus Chen' },
          vehicleType: { type: 'string', enum: ['truck', 'van', 'car', 'motorcycle'], example: 'truck' },
          groupId: { type: 'string', example: 'riyadh-central' },
          zone: { type: 'string', example: 'Central Riyadh' },
          status: { type: 'string', enum: ['moving', 'idle', 'offline'], example: 'moving' },
          speed: { type: 'number', example: 67 },
          bearing: { type: 'number', example: 42.5 },
          fuelLevel: { type: 'number', example: 78 },
          lat: { type: 'number', example: 24.7118 },
          lng: { type: 'number', example: 46.6745 },
          odometer: { type: 'number', example: 48302 },
          engineHours: { type: 'number', example: 1240 },
          tripDistance: { type: 'number', example: 34.2 },
          location: { type: 'string', example: 'Olaya Street, Central Riyadh' },
          lastUpdate: { type: 'string', example: 'Just now' },
          telemetry: {
            type: 'object',
            properties: {
              towing: { type: 'boolean', example: false },
              gpsState: { type: 'string', example: 'online' },
              batteryVoltage: { type: 'number', example: 13.8 },
              satellites: { type: 'integer', example: 12 },
              waslState: { type: 'string', example: 'connected' },
              actualWeightTons: { type: 'number', example: 8.8 },
            },
          },
          sensors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', example: 'Engine Temp' },
                value: { type: 'string', example: '92' },
                unit: { type: 'string', example: '°C' },
                current: { type: 'number', example: 92 },
              },
            },
          },
        },
      },
    },
  },
}
