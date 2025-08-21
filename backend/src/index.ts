import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { PrismaClient } from '@prisma/client';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';

// Import routes
import ticketRoutes from './routes/tickets';
import permitRoutes from './routes/permits';
import trafficPlanRoutes from './routes/traffic-plans';
import inspectionRoutes from './routes/inspections';
import evidenceRoutes from './routes/evidence';
import closeoutRoutes from './routes/closeouts';
import auditRoutes from './routes/audit';
import authRoutes from './routes/auth';

// Import services
import { TicketProcessor } from './services/ticket-processor';
import { initializeQueues } from './services/queue-service';

// Import middleware
import { 
  authenticate, 
  requirePermitCoordinator,
  requireFieldSupervisor,
  requireComplianceManager,
  requireAnyRole,
  requireManagerOrCoordinator
} from './middleware/auth';

const prisma = new PrismaClient();

const buildServer = async () => {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development' 
        ? { target: 'pino-pretty' }
        : undefined
    }
  });

  // Initialize queues
  const queues = await initializeQueues();

  // Set up Bull Board for queue monitoring
  const serverAdapter = new FastifyAdapter();
  createBullBoard({
    queues: Object.values(queues).map(queue => new BullMQAdapter(queue)),
    serverAdapter
  });
  serverAdapter.setBasePath('/admin/queues');
  server.register(serverAdapter.registerPlugin(), { prefix: '/admin/queues' });

  // Register plugins
  await server.register(helmet);
  await server.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  });
  
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
  });

  await server.register(multipart);
  
  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  });

  // Swagger documentation
  await server.register(swagger, {
    swagger: {
      info: {
        title: 'Utility Permitting Copilot API',
        description: 'API for 811 ticket intake and municipal permitting',
        version: '1.0.0'
      },
      host: 'localhost:8000',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        JWT: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      }
    }
  });

  await server.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    }
  });

  // Decorate server with dependencies
  server.decorate('prisma', prisma);
  server.decorate('queues', queues);

  // Register auth middleware
  server.decorate('authenticate', authenticate);
  server.decorate('requirePermitCoordinator', requirePermitCoordinator);
  server.decorate('requireFieldSupervisor', requireFieldSupervisor);
  server.decorate('requireComplianceManager', requireComplianceManager);
  server.decorate('requireAnyRole', requireAnyRole);
  server.decorate('requireManagerOrCoordinator', requireManagerOrCoordinator);

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register routes
  server.register(authRoutes, { prefix: '/api/auth' });
  server.register(ticketRoutes, { prefix: '/api/tickets' });
  server.register(permitRoutes, { prefix: '/api/permits' });
  server.register(trafficPlanRoutes, { prefix: '/api/traffic-plans' });
  server.register(inspectionRoutes, { prefix: '/api/inspections' });
  server.register(evidenceRoutes, { prefix: '/api/evidence' });
  server.register(closeoutRoutes, { prefix: '/api/closeouts' });
  server.register(auditRoutes, { prefix: '/api/audit' });

  return server;
};

const start = async () => {
  try {
    const server = await buildServer();
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    server.log.info(`Server listening on http://${host}:${port}`);
    server.log.info(`API documentation available at http://${host}:${port}/docs`);
    server.log.info(`Queue monitoring available at http://${host}:${port}/admin/queues`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();