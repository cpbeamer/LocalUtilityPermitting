import { TicketStatus, UserRole } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};

export const getStatusColor = (status: TicketStatus): string => {
  switch (status) {
    case TicketStatus.INTAKE:
      return 'bg-blue-100 text-blue-800';
    case TicketStatus.PERMIT_FILED:
      return 'bg-yellow-100 text-yellow-800';
    case TicketStatus.INSPECTION_SCHEDULED:
      return 'bg-purple-100 text-purple-800';
    case TicketStatus.FIELD_WORK:
      return 'bg-orange-100 text-orange-800';
    case TicketStatus.INSPECTION_PENDING:
      return 'bg-indigo-100 text-indigo-800';
    case TicketStatus.CLOSED:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getUserRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case UserRole.PERMIT_COORDINATOR:
      return 'Permit Coordinator';
    case UserRole.FIELD_SUPERVISOR:
      return 'Field Supervisor';
    case UserRole.COMPLIANCE_MANAGER:
      return 'Compliance Manager';
    default:
      return role;
  }
};

export const generateTicketNumber = (organizationCode: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${organizationCode}-${timestamp}-${random}`;
};

export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};