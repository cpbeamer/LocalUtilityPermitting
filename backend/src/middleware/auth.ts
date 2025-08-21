import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@utility-copilot/shared';

export interface AuthenticatedUser {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({ error: 'No token provided' });
    }

    // Verify JWT token
    const decoded = request.server.jwt.verify(token) as any;
    
    // Get user from database
    const user = await request.server.prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organization: true }
    });

    if (!user || !user.isActive) {
      return reply.status(401).send({ error: 'Invalid or inactive user' });
    }

    // Add user to request
    request.user = {
      id: user.id,
      organizationId: user.organizationId,
      email: user.email,
      name: user.name,
      role: user.role,
    };

  } catch (error) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
};

export const authorize = (allowedRoles: UserRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: request.user.role
      });
    }
  };
};

// Role-based authorization helpers
export const requirePermitCoordinator = authorize([UserRole.PERMIT_COORDINATOR]);
export const requireFieldSupervisor = authorize([UserRole.FIELD_SUPERVISOR]);
export const requireComplianceManager = authorize([UserRole.COMPLIANCE_MANAGER]);

export const requireAnyRole = authorize([
  UserRole.PERMIT_COORDINATOR,
  UserRole.FIELD_SUPERVISOR,
  UserRole.COMPLIANCE_MANAGER
]);

export const requireManagerOrCoordinator = authorize([
  UserRole.PERMIT_COORDINATOR,
  UserRole.COMPLIANCE_MANAGER
]);