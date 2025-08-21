import { FastifyPluginAsync } from 'fastify';

const closeoutRoutes: FastifyPluginAsync = async (fastify) => {
  // Submit closeout
  fastify.post('/submit', {
    schema: {
      description: 'Submit ticket closeout',
      tags: ['closeouts'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate, fastify.requireAnyRole]
  }, async (request, reply) => {
    return reply.send({ success: true, message: 'Closeout submission - TODO' });
  });

  // Get closeouts
  fastify.get('/', {
    schema: {
      description: 'Get closeouts',
      tags: ['closeouts'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate, fastify.requireAnyRole]
  }, async (request, reply) => {
    return reply.send({ success: true, data: [] });
  });
};

export default closeoutRoutes;