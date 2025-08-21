import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const permitPrefillSchema = z.object({
  ticketId: z.string().uuid(),
  municipality: z.string(),
  permitType: z.string()
});

const permitRoutes: FastifyPluginAsync = async (fastify) => {
  // Prefill permit application
  fastify.post('/prefill', {
    schema: {
      description: 'Prefill permit application using AI',
      tags: ['permits'],
      security: [{ JWT: [] }],
      body: {
        type: 'object',
        required: ['ticketId', 'municipality', 'permitType'],
        properties: {
          ticketId: { type: 'string' },
          municipality: { type: 'string' },
          permitType: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requirePermitCoordinator]
  }, async (request, reply) => {
    try {
      const { ticketId, municipality, permitType } = permitPrefillSchema.parse(request.body);

      // Get ticket data
      const ticket = await fastify.prisma.ticket.findFirst({
        where: {
          id: ticketId,
          organizationId: request.user!.organizationId
        }
      });

      if (!ticket) {
        return reply.status(404).send({
          success: false,
          error: 'Ticket not found'
        });
      }

      // Mock AI prefill - in production, this would call OpenAI API
      const prefilledData = {
        applicantName: ticket.excavatorName,
        applicantPhone: ticket.excavatorPhone,
        applicantEmail: ticket.excavatorEmail,
        workAddress: ticket.workAddress,
        workDescription: ticket.workDescription,
        workStartDate: ticket.workStartDate.toISOString().split('T')[0],
        workEndDate: ticket.workEndDate.toISOString().split('T')[0],
        utilityTypes: ticket.utilityTypes,
        emergencyContact: ticket.emergencyContact,
        // Municipal-specific fields based on permit type
        municipality,
        permitType,
        estimatedCost: '$2,500',
        trafficControlRequired: ticket.utilityTypes.some(type => 
          ['ELECTRIC', 'GAS', 'FIBER'].includes(type)
        ),
        specialRequirements: 'Standard utility installation',
      };

      // Create permit record
      const permit = await fastify.prisma.permit.create({
        data: {
          ticketId,
          organizationId: request.user!.organizationId,
          municipality,
          permitType,
          applicationData: {},
          prefilledData,
          fee: 75.00, // Mock fee
          status: 'DRAFT'
        }
      });

      return reply.send({
        success: true,
        data: { permitId: permit.id, prefilledData }
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
        error: 'Failed to prefill permit'
      });
    }
  });

  // Get permits
  fastify.get('/', {
    schema: {
      description: 'Get permits for organization',
      tags: ['permits'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate, fastify.requireAnyRole]
  }, async (request, reply) => {
    try {
      const permits = await fastify.prisma.permit.findMany({
        where: {
          organizationId: request.user!.organizationId
        },
        include: {
          ticket: {
            select: {
              ticketNumber: true,
              workAddress: true,
              excavatorName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return reply.send({
        success: true,
        data: { permits }
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch permits'
      });
    }
  });

  // Get permit by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get permit by ID',
      tags: ['permits'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate, fastify.requireAnyRole]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const permit = await fastify.prisma.permit.findFirst({
        where: {
          id,
          organizationId: request.user!.organizationId
        },
        include: {
          ticket: true
        }
      });

      if (!permit) {
        return reply.status(404).send({
          success: false,
          error: 'Permit not found'
        });
      }

      return reply.send({
        success: true,
        data: { permit }
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch permit'
      });
    }
  });

  // Update permit
  fastify.patch('/:id', {
    schema: {
      description: 'Update permit application data',
      tags: ['permits'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate, fastify.requirePermitCoordinator]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updates = request.body as Record<string, any>;

      const permit = await fastify.prisma.permit.findFirst({
        where: {
          id,
          organizationId: request.user!.organizationId
        }
      });

      if (!permit) {
        return reply.status(404).send({
          success: false,
          error: 'Permit not found'
        });
      }

      const updatedPermit = await fastify.prisma.permit.update({
        where: { id },
        data: {
          applicationData: {
            ...permit.applicationData as object,
            ...updates
          },
          updatedAt: new Date()
        }
      });

      return reply.send({
        success: true,
        data: { permit: updatedPermit }
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update permit'
      });
    }
  });

  // Submit permit
  fastify.post('/:id/submit', {
    schema: {
      description: 'Submit permit to municipal authority',
      tags: ['permits'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate, fastify.requirePermitCoordinator]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const permit = await fastify.prisma.permit.findFirst({
        where: {
          id,
          organizationId: request.user!.organizationId
        }
      });

      if (!permit) {
        return reply.status(404).send({
          success: false,
          error: 'Permit not found'
        });
      }

      // Mock submission to municipal portal
      const permitNumber = `${permit.municipality.toUpperCase()}-${Date.now()}`;

      const updatedPermit = await fastify.prisma.permit.update({
        where: { id },
        data: {
          permitNumber,
          status: 'SUBMITTED',
          submittedAt: new Date()
        }
      });

      return reply.send({
        success: true,
        data: { 
          permit: updatedPermit,
          message: 'Permit submitted successfully'
        }
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to submit permit'
      });
    }
  });
};

export default permitRoutes;