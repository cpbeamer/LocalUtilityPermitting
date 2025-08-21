import { FastifyPluginAsync } from 'fastify';

const auditRoutes: FastifyPluginAsync = async (fastify) => {
  // Get audit logs for a ticket
  fastify.get('/:ticketId', {
    schema: {
      description: 'Get audit trail for a ticket',
      tags: ['audit'],
      security: [{ JWT: [] }],
      params: {
        type: 'object',
        required: ['ticketId'],
        properties: {
          ticketId: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireAnyRole]
  }, async (request, reply) => {
    try {
      const { ticketId } = request.params as { ticketId: string };

      // Verify ticket belongs to organization
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

      const auditLogs = await fastify.prisma.auditLog.findMany({
        where: { ticketId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { timestamp: 'desc' }
      });

      return reply.send({
        success: true,
        data: { auditLogs }
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch audit logs'
      });
    }
  });

  // Export audit data for a ticket
  fastify.get('/:ticketId/export', {
    schema: {
      description: 'Export complete audit package for a ticket',
      tags: ['audit'],
      security: [{ JWT: [] }],
      params: {
        type: 'object',
        required: ['ticketId'],
        properties: {
          ticketId: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireManagerOrCoordinator]
  }, async (request, reply) => {
    try {
      const { ticketId } = request.params as { ticketId: string };

      // Get complete ticket data with all related entities
      const ticket = await fastify.prisma.ticket.findFirst({
        where: {
          id: ticketId,
          organizationId: request.user!.organizationId
        },
        include: {
          permits: true,
          trafficPlans: true,
          inspections: true,
          evidence: true,
          fees: true,
          auditLogs: {
            include: {
              user: {
                select: { name: true, email: true, role: true }
              }
            }
          }
        }
      });

      if (!ticket) {
        return reply.status(404).send({
          success: false,
          error: 'Ticket not found'
        });
      }

      // Create audit package
      const auditPackage = {
        exportedAt: new Date().toISOString(),
        exportedBy: request.user!.name,
        ticket: {
          basic: {
            ticketNumber: ticket.ticketNumber,
            status: ticket.status,
            workAddress: ticket.workAddress,
            excavatorName: ticket.excavatorName,
            workDescription: ticket.workDescription,
            workStartDate: ticket.workStartDate,
            workEndDate: ticket.workEndDate,
            createdAt: ticket.createdAt
          },
          permits: ticket.permits.map(permit => ({
            permitNumber: permit.permitNumber,
            municipality: permit.municipality,
            permitType: permit.permitType,
            status: permit.status,
            fee: permit.fee,
            submittedAt: permit.submittedAt,
            approvedAt: permit.approvedAt
          })),
          trafficPlans: ticket.trafficPlans.map(plan => ({
            templateName: plan.templateName,
            createdAt: plan.createdAt,
            pdfPath: plan.pdfPath
          })),
          inspections: ticket.inspections.map(inspection => ({
            inspectionType: inspection.inspectionType,
            scheduledDate: inspection.scheduledDate,
            inspector: inspection.inspector,
            status: inspection.status,
            completedAt: inspection.completedAt
          })),
          evidence: ticket.evidence.map(evidence => ({
            type: evidence.type,
            title: evidence.title,
            fileType: evidence.fileType,
            capturedAt: evidence.capturedAt,
            gpsLatitude: evidence.gpsLatitude,
            gpsLongitude: evidence.gpsLongitude
          })),
          fees: ticket.fees.map(fee => ({
            type: fee.type,
            description: fee.description,
            amount: fee.amount,
            status: fee.status,
            dueDate: fee.dueDate,
            paidDate: fee.paidDate
          })),
          auditTrail: ticket.auditLogs.map(log => ({
            timestamp: log.timestamp,
            action: log.action,
            entityType: log.entityType,
            user: log.user.name,
            userRole: log.user.role,
            previousData: log.previousData,
            newData: log.newData
          }))
        }
      };

      return reply.send({
        success: true,
        data: auditPackage
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to export audit package'
      });
    }
  });

  // Get organization-wide audit summary
  fastify.get('/organization/summary', {
    schema: {
      description: 'Get audit summary for organization',
      tags: ['audit'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate, fastify.requireComplianceManager]
  }, async (request, reply) => {
    try {
      const organizationId = request.user!.organizationId;

      const [
        totalActions,
        recentActions,
        actionsByType,
        actionsByUser
      ] = await Promise.all([
        fastify.prisma.auditLog.count({
          where: { organizationId }
        }),
        fastify.prisma.auditLog.findMany({
          where: { organizationId },
          include: {
            user: { select: { name: true, role: true } },
            ticket: { select: { ticketNumber: true } }
          },
          orderBy: { timestamp: 'desc' },
          take: 50
        }),
        fastify.prisma.auditLog.groupBy({
          by: ['action'],
          where: { organizationId },
          _count: { action: true }
        }),
        fastify.prisma.auditLog.groupBy({
          by: ['userId'],
          where: { organizationId },
          _count: { userId: true }
        })
      ]);

      return reply.send({
        success: true,
        data: {
          totalActions,
          recentActions,
          actionsByType,
          actionsByUser
        }
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch audit summary'
      });
    }
  });
};

export default auditRoutes;