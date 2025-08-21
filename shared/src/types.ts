import { z } from 'zod';

// User roles
export enum UserRole {
  PERMIT_COORDINATOR = 'PERMIT_COORDINATOR',
  FIELD_SUPERVISOR = 'FIELD_SUPERVISOR', 
  COMPLIANCE_MANAGER = 'COMPLIANCE_MANAGER'
}

// Ticket status
export enum TicketStatus {
  INTAKE = 'INTAKE',
  PERMIT_FILED = 'PERMIT_FILED',
  INSPECTION_SCHEDULED = 'INSPECTION_SCHEDULED',
  FIELD_WORK = 'FIELD_WORK',
  INSPECTION_PENDING = 'INSPECTION_PENDING',
  CLOSED = 'CLOSED'
}

// Utility types
export enum UtilityType {
  ELECTRIC = 'ELECTRIC',
  GAS = 'GAS',
  WATER = 'WATER',
  SEWER = 'SEWER',
  TELECOM = 'TELECOM',
  CABLE = 'CABLE',
  FIBER = 'FIBER'
}

// Evidence types
export enum EvidenceType {
  LOCATE_PROOF = 'LOCATE_PROOF',
  INSPECTION_EVIDENCE = 'INSPECTION_EVIDENCE',
  AS_BUILT = 'AS_BUILT',
  COMPLIANCE_PHOTO = 'COMPLIANCE_PHOTO'
}

// Zod schemas
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  address: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const TicketSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  ticketNumber: z.string(),
  source: z.string(),
  status: z.nativeEnum(TicketStatus),
  excavatorName: z.string(),
  excavatorPhone: z.string(),
  excavatorEmail: z.string().email().optional(),
  workAddress: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  utilityTypes: z.array(z.nativeEnum(UtilityType)),
  workStartDate: z.date(),
  workEndDate: z.date(),
  workDescription: z.string(),
  emergencyContact: z.string().optional(),
  rawData: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const PermitSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  organizationId: z.string().uuid(),
  permitNumber: z.string().optional(),
  municipality: z.string(),
  permitType: z.string(),
  applicationData: z.record(z.any()),
  prefilledData: z.record(z.any()),
  fee: z.number(),
  status: z.string(),
  submittedAt: z.date().optional(),
  approvedAt: z.date().optional(),
  pdfPath: z.string().optional(),
  xmlPath: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const TrafficPlanSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  organizationId: z.string().uuid(),
  templateId: z.string(),
  templateName: z.string(),
  generatedData: z.record(z.any()),
  pdfPath: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const InspectionSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  permitId: z.string().uuid().optional(),
  organizationId: z.string().uuid(),
  inspectionType: z.string(),
  scheduledDate: z.date(),
  scheduledTime: z.string(),
  inspector: z.string(),
  inspectorContact: z.string(),
  status: z.string(),
  notes: z.string().optional(),
  completedAt: z.date().optional(),
  calendarEventId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const EvidenceSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.nativeEnum(EvidenceType),
  title: z.string(),
  description: z.string().optional(),
  filePath: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  gpsLatitude: z.number().optional(),
  gpsLongitude: z.number().optional(),
  capturedAt: z.date(),
  createdAt: z.date()
});

export const FeeSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  organizationId: z.string().uuid(),
  type: z.string(),
  description: z.string(),
  amount: z.number(),
  dueDate: z.date(),
  paidDate: z.date().optional(),
  paidAmount: z.number().optional(),
  status: z.string(),
  referenceNumber: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().uuid(),
  previousData: z.record(z.any()).optional(),
  newData: z.record(z.any()),
  timestamp: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

// TypeScript types derived from schemas
export type Organization = z.infer<typeof OrganizationSchema>;
export type User = z.infer<typeof UserSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
export type Permit = z.infer<typeof PermitSchema>;
export type TrafficPlan = z.infer<typeof TrafficPlanSchema>;
export type Inspection = z.infer<typeof InspectionSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type Fee = z.infer<typeof FeeSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard summary types
export interface DashboardSummary {
  ticketsPending: number;
  permitsAwaitingApproval: number;
  inspectionsUpcoming: number;
  feesOutstanding: number;
  recentTickets: Ticket[];
}