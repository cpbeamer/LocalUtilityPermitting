import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserRole } from '@utility-copilot/shared';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.nativeEnum(UserRole),
  organizationId: z.string().uuid(),
});

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Login
  fastify.post('/login', {
    schema: {
      description: 'User login',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string' },
                    organizationId: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);

      // Find user
      const user = await fastify.prisma.user.findUnique({
        where: { email },
        include: { organization: true }
      });

      if (!user || !user.isActive) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = fastify.jwt.sign(
        { 
          userId: user.id,
          organizationId: user.organizationId,
          role: user.role 
        },
        { expiresIn: '24h' }
      );

      return reply.send({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
            organization: {
              id: user.organization.id,
              name: user.organization.name,
              code: user.organization.code
            }
          }
        }
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
        error: 'Internal server error'
      });
    }
  });

  // Register (admin only - for creating new users)
  fastify.post('/register', {
    schema: {
      description: 'Register new user',
      tags: ['auth'],
      security: [{ JWT: [] }],
      body: {
        type: 'object',
        required: ['email', 'password', 'name', 'role', 'organizationId'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
          role: { 
            type: 'string',
            enum: Object.values(UserRole)
          },
          organizationId: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireComplianceManager]
  }, async (request, reply) => {
    try {
      const userData = registerSchema.parse(request.body);

      // Check if user already exists
      const existingUser = await fastify.prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        return reply.status(409).send({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Verify organization exists and user has access
      const organization = await fastify.prisma.organization.findUnique({
        where: { id: userData.organizationId }
      });

      if (!organization) {
        return reply.status(404).send({
          success: false,
          error: 'Organization not found'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await fastify.prisma.user.create({
        data: {
          email: userData.email,
          passwordHash,
          name: userData.name,
          role: userData.role,
          organizationId: userData.organizationId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
          isActive: true,
          createdAt: true
        }
      });

      return reply.status(201).send({
        success: true,
        data: { user }
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
        error: 'Internal server error'
      });
    }
  });

  // Get current user profile
  fastify.get('/me', {
    schema: {
      description: 'Get current user profile',
      tags: ['auth'],
      security: [{ JWT: [] }]
    },
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user!.id },
      include: { organization: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        isActive: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return reply.send({
      success: true,
      data: { user }
    });
  });

  // Update password
  fastify.patch('/password', {
    schema: {
      description: 'Update user password',
      tags: ['auth'],
      security: [{ JWT: [] }],
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 }
        }
      }
    },
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { currentPassword, newPassword } = request.body as {
        currentPassword: string;
        newPassword: string;
      };

      // Get current user with password
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user!.id }
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return reply.status(400).send({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await fastify.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      });

      return reply.send({
        success: true,
        message: 'Password updated successfully'
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });
};

export default authRoutes;