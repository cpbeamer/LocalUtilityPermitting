import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { TicketStatus, UtilityType } from '@utility-copilot/shared';
import { TicketProcessor } from '../services/ticket-processor';
import { addTicketProcessingJob, addPermitPrefillJob } from '../services/queue-service';

const importTicketSchema = z.object({
  source: z.string(),
  payload: z.object({
    ticketNumber: z.string().optional(),
    requestDate: z.string(),
    workStartDate: z.string(),
    workEndDate: z.string(),
    excavatorCompany: z.string(),
    excavatorContact: z.object({
      name: z.string(),
      phone: z.string(),
      email: z.string().email().optional(),
    }),
    workLocation: z.object({
      address: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
    }),
    workDescription: z.string(),
    utilityTypes: z.array(z.string()),
    emergencyContact: z.string().optional(),
    specialInstructions: z.string().optional(),
  })
});

const ticketRoutes: FastifyPluginAsync = async (fastify) => {
  // Import 811 ticket
  fastify.post('/import', {
    schema: {
      description: 'Import 811 ticket',
      tags: ['tickets'],
      security: [{ JWT: [] }],
      body: {
        type: 'object',
        required: ['source', 'payload'],
        properties: {
          source: { type: 'string' },
          payload: { type: 'object' }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requirePermitCoordinator]
  }, async (request, reply) => {
    try {
      const { source, payload } = importTicketSchema.parse(request.body);

      // Validate ticket data
      const validationErrors = await TicketProcessor.validateTicketData(payload);
      if (validationErrors.length > 0) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
      }

      // Process the ticket
      const ticket = await TicketProcessor.parse811Data(payload, request.user!.organizationId);

      // Add to processing queue
      await addTicketProcessingJob({
        ticketId: ticket.id,
        organizationId: ticket.organizationId,
        rawData: payload
      });

      return reply.status(201).send({
        success: true,
        data: { ticketId: ticket.id, ticketNumber: ticket.ticketNumber }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to import ticket'
      });
    }
  });

  // Get all tickets
  fastify.get('/', {
    schema: {
      description: 'Get all tickets for organization',
      tags: ['tickets'],
      security: [{ JWT: [] }],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireAnyRole]
  }, async (request, reply) => {
    try {
      const { status, page = 1, limit = 20 } = request.query as any;
      const offset = (page - 1) * limit;

      const where: any = {
        organizationId: request.user!.organizationId
      };

      if (status) {
        where.status = status;
      }

      const [tickets, total] = await Promise.all([
        fastify.prisma.ticket.findMany({
          where,
          include: {
            permits: {
              select: { id: true, status: true, municipality: true }
            },
            inspections: {
              select: { id: true, status: true, scheduledDate: true }
            },
            _count: {
              select: { evidence: true, fees: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit
        }),
        fastify.prisma.ticket.count({ where })
      ]);

      return reply.send({
        success: true,
        data: {
          tickets,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch tickets'
      });
    }
  });

  // Get ticket by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get ticket by ID',
      tags: ['tickets'],
      security: [{ JWT: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireAnyRole]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const ticket = await fastify.prisma.ticket.findFirst({
        where: {
          id,
          organizationId: request.user!.organizationId
        },
        include: {
          permits: true,
          trafficPlans: true,
          inspections: true,
          evidence: true,
          fees: true
        }
      });

      if (!ticket) {
        return reply.status(404).send({
          success: false,
          error: 'Ticket not found'
        });
      }

      return reply.send({
        success: true,
        data: { ticket }
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch ticket'
      });
    }
  });

  // Update ticket status
  fastify.patch('/:id/status', {
    schema: {
      description: 'Update ticket status',
      tags: ['tickets'],
      security: [{ JWT: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: Object.values(TicketStatus)
          }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireManagerOrCoordinator]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: TicketStatus };

      // Verify ticket belongs to organization
      const existingTicket = await fastify.prisma.ticket.findFirst({
        where: {
          id,
          organizationId: request.user!.organizationId
        }
      });

      if (!existingTicket) {
        return reply.status(404).send({
          success: false,
          error: 'Ticket not found'
        });
      }

      const updatedTicket = await TicketProcessor.updateTicketStatus(
        id,
        status,
        request.user!.id
      );

      return reply.send({
        success: true,
        data: { ticket: updatedTicket }
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update ticket status'
      });
    }
  });

  // Trigger permit prefill
  fastify.post('/:id/prefill-permit', {
    schema: {
      description: 'Trigger permit prefill for ticket',
      tags: ['tickets'],
      security: [{ JWT: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['municipality', 'permitType'],
        properties: {
          municipality: { type: 'string' },
          permitType: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requirePermitCoordinator]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { municipality, permitType } = request.body as {
        municipality: string;
        permitType: string;
      };

      // Verify ticket exists and belongs to organization
      const ticket = await fastify.prisma.ticket.findFirst({
        where: {
          id,
          organizationId: request.user!.organizationId
        }
      });

      if (!ticket) {
        return reply.status(404).send({
          success: false,
          error: 'Ticket not found'
        });
      }

      // Add permit prefill job
      await addPermitPrefillJob({
        ticketId: id,
        municipality,
        permitType
      });

      return reply.send({
        success: true,
        message: 'Permit prefill job queued'
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to trigger permit prefill'
      });
    }
  });

  // Get dashboard summary
  fastify.get('/dashboard/summary', {
    schema: {
      description: 'Get dashboard summary',
      tags: ['tickets'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate, fastify.requireAnyRole]
  }, async (request, reply) => {
    try {
      const organizationId = request.user!.organizationId;

      const [
        ticketsPending,
        permitsAwaitingApproval,
        inspectionsUpcoming,
        feesOutstanding,
        recentTickets
      ] = await Promise.all([
        fastify.prisma.ticket.count({
          where: {
            organizationId,
            status: { in: [TicketStatus.INTAKE, TicketStatus.PERMIT_FILED] }
          }
        }),
        fastify.prisma.permit.count({
          where: {
            organizationId,
            status: 'PENDING_APPROVAL'
          }
        }),
        fastify.prisma.inspection.count({
          where: {
            organizationId,
            scheduledDate: { gte: new Date() },
            status: 'SCHEDULED'
          }
        }),
        fastify.prisma.fee.count({
          where: {
            organizationId,
            status: 'OUTSTANDING'
          }
        }),
        fastify.prisma.ticket.findMany({
          where: { organizationId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            permits: { select: { status: true } },
            inspections: { select: { status: true } }
          }
        })
      ]);

      return reply.send({
        success: true,
        data: {
          ticketsPending,
          permitsAwaitingApproval,
          inspectionsUpcoming,
          feesOutstanding,
          recentTickets
        }
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch dashboard summary'
      });
    }
  });
};

export default ticketRoutes;