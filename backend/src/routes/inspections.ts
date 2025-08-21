import { FastifyPluginAsync } from 'fastify';

const inspectionRoutes: FastifyPluginAsync = async (fastify) => {
  // Schedule inspection
  fastify.post('/schedule', {
    schema: {
      description: 'Schedule inspection',
      tags: ['inspections'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate, fastify.requireAnyRole]
  }, async (request, reply) => {
    return reply.send({ success: true, message: 'Inspection scheduling - TODO' });
  });

  // Get inspections
  fastify.get('/', {
    schema: {
      description: 'Get inspections',
      tags: ['inspections'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate, fastify.requireAnyRole]
  }, async (request, reply) => {
    return reply.send({ success: true, data: [] });
  });
};

export default inspectionRoutes;