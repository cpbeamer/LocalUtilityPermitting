import { PrismaClient } from '@prisma/client';
import { TicketStatus, UtilityType, generateTicketNumber } from '@utility-copilot/shared';

const prisma = new PrismaClient();

export interface Raw811Data {
  ticketNumber: string;
  requestDate: string;
  workStartDate: string;
  workEndDate: string;
  excavatorCompany: string;
  excavatorContact: {
    name: string;
    phone: string;
    email?: string;
  };
  workLocation: {
    address: string;
    city: string;
    state: string;
    zip: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  workDescription: string;
  utilityTypes: string[];
  emergencyContact?: string;
  specialInstructions?: string;
}

export class TicketProcessor {
  static async parse811Data(rawData: Raw811Data, organizationId: string) {
    try {
      // Parse utility types
      const utilityTypes = this.parseUtilityTypes(rawData.utilityTypes);
      
      // Generate coordinates if not provided
      const coordinates = rawData.workLocation.coordinates || 
        await this.geocodeAddress(rawData.workLocation.address);

      // Create ticket record
      const ticket = await prisma.ticket.create({
        data: {
          organizationId,
          ticketNumber: rawData.ticketNumber || generateTicketNumber('TX811'),
          source: '811',
          status: TicketStatus.INTAKE,
          excavatorName: rawData.excavatorCompany,
          excavatorPhone: rawData.excavatorContact.phone,
          excavatorEmail: rawData.excavatorContact.email,
          workAddress: `${rawData.workLocation.address}, ${rawData.workLocation.city}, ${rawData.workLocation.state} ${rawData.workLocation.zip}`,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          utilityTypes,
          workStartDate: new Date(rawData.workStartDate),
          workEndDate: new Date(rawData.workEndDate),
          workDescription: rawData.workDescription,
          emergencyContact: rawData.emergencyContact,
          rawData: rawData as any,
        },
      });

      // Create audit log entry
      await this.createAuditLog({
        ticketId: ticket.id,
        organizationId,
        userId: 'system', // System user for automated processing
        action: 'TICKET_CREATED',
        entityType: 'TICKET',
        entityId: ticket.id,
        newData: ticket,
      });

      return ticket;
    } catch (error) {
      console.error('Error parsing 811 data:', error);
      throw new Error('Failed to parse 811 ticket data');
    }
  }

  static parseUtilityTypes(utilityTypeStrings: string[]): UtilityType[] {
    const typeMap: Record<string, UtilityType> = {
      'electric': UtilityType.ELECTRIC,
      'electricity': UtilityType.ELECTRIC,
      'power': UtilityType.ELECTRIC,
      'gas': UtilityType.GAS,
      'natural gas': UtilityType.GAS,
      'water': UtilityType.WATER,
      'sewer': UtilityType.SEWER,
      'wastewater': UtilityType.SEWER,
      'telecom': UtilityType.TELECOM,
      'telephone': UtilityType.TELECOM,
      'cable': UtilityType.CABLE,
      'fiber': UtilityType.FIBER,
      'fiber optic': UtilityType.FIBER,
    };

    return utilityTypeStrings
      .map(type => typeMap[type.toLowerCase()])
      .filter(Boolean);
  }

  static async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
    // Mock geocoding - in production, use Google Maps API or similar
    const mockCoordinates = {
      latitude: 30.2672 + (Math.random() - 0.5) * 0.1, // Austin, TX area
      longitude: -97.7431 + (Math.random() - 0.5) * 0.1,
    };

    console.log(`Geocoding address: ${address} -> ${mockCoordinates.latitude}, ${mockCoordinates.longitude}`);
    return mockCoordinates;
  }

  static async createAuditLog(data: {
    ticketId: string;
    organizationId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    previousData?: any;
    newData: any;
  }) {
    return await prisma.auditLog.create({
      data: {
        ...data,
        timestamp: new Date(),
      },
    });
  }

  static async updateTicketStatus(ticketId: string, status: TicketStatus, userId: string) {
    const previousTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!previousTicket) {
      throw new Error('Ticket not found');
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status, updatedAt: new Date() },
    });

    // Create audit log
    await this.createAuditLog({
      ticketId,
      organizationId: previousTicket.organizationId,
      userId,
      action: 'STATUS_UPDATED',
      entityType: 'TICKET',
      entityId: ticketId,
      previousData: { status: previousTicket.status },
      newData: { status },
    });

    return updatedTicket;
  }

  static async validateTicketData(ticketData: Partial<Raw811Data>): Promise<string[]> {
    const errors: string[] = [];

    if (!ticketData.excavatorCompany) {
      errors.push('Excavator company is required');
    }

    if (!ticketData.excavatorContact?.phone) {
      errors.push('Excavator phone is required');
    }

    if (!ticketData.workLocation?.address) {
      errors.push('Work address is required');
    }

    if (!ticketData.workStartDate) {
      errors.push('Work start date is required');
    }

    if (!ticketData.workEndDate) {
      errors.push('Work end date is required');
    }

    if (!ticketData.workDescription) {
      errors.push('Work description is required');
    }

    if (!ticketData.utilityTypes || ticketData.utilityTypes.length === 0) {
      errors.push('At least one utility type is required');
    }

    if (ticketData.workStartDate && ticketData.workEndDate) {
      const startDate = new Date(ticketData.workStartDate);
      const endDate = new Date(ticketData.workEndDate);
      
      if (startDate >= endDate) {
        errors.push('Work start date must be before end date');
      }
    }

    return errors;
  }
}