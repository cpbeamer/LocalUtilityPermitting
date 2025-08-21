import { FastifyPluginAsync } from 'fastify';

const evidenceRoutes: FastifyPluginAsync = async (fastify) => {
  // Upload evidence
  fastify.post('/upload', {
    schema: {
      description: 'Upload field evidence',
      tags: ['evidence'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate, fastify.requireAnyRole]
  }, async (request, reply) => {
    return reply.send({ success: true, message: 'Evidence upload - TODO' });
  });

  // Get evidence
  fastify.get('/', {
    schema: {
      description: 'Get evidence',
      tags: ['evidence'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate, fastify.requireAnyRole]
  }, async (request, reply) => {
    return reply.send({ success: true, data: [] });
  });
};

export default evidenceRoutes;