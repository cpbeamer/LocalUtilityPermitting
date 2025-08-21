import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserRole, TicketStatus, UtilityType, EvidenceType } from '@utility-copilot/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Austin Utility Contractors',
      code: 'AUC',
      address: '123 Business Drive, Austin, TX 78701',
      contactEmail: 'info@austinutils.com',
      contactPhone: '(512) 555-0100'
    }
  });

  console.log('✅ Created organization:', organization.name);

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        organizationId: organization.id,
        email: 'coordinator@austinutils.com',
        passwordHash: await bcrypt.hash('password123', 12),
        name: 'Sarah Johnson',
        role: UserRole.PERMIT_COORDINATOR
      }
    }),
    prisma.user.create({
      data: {
        organizationId: organization.id,
        email: 'supervisor@austinutils.com',
        passwordHash: await bcrypt.hash('password123', 12),
        name: 'Mike Rodriguez',
        role: UserRole.FIELD_SUPERVISOR
      }
    }),
    prisma.user.create({
      data: {
        organizationId: organization.id,
        email: 'compliance@austinutils.com',
        passwordHash: await bcrypt.hash('password123', 12),
        name: 'Jennifer Chen',
        role: UserRole.COMPLIANCE_MANAGER
      }
    })
  ]);

  console.log('✅ Created users:', users.map(u => u.name).join(', '));

  // Create sample 811 ticket
  const ticket = await prisma.ticket.create({
    data: {
      organizationId: organization.id,
      ticketNumber: 'TX-811-2025-12345',
      source: '811',
      status: TicketStatus.PERMIT_FILED,
      excavatorName: 'Fiber Connect Solutions',
      excavatorPhone: '(512) 555-0200',
      excavatorEmail: 'project@fiberconnect.com',
      workAddress: '123 Main Street, Austin, TX 78701',
      latitude: 30.2672,
      longitude: -97.7431,
      utilityTypes: [UtilityType.FIBER, UtilityType.ELECTRIC],
      workStartDate: new Date('2025-03-01'),
      workEndDate: new Date('2025-03-15'),
      workDescription: 'Installation of fiber optic cable for residential internet service. Work includes trenching, conduit installation, and restoration.',
      emergencyContact: '(512) 555-0300',
      rawData: {
        originalTicket: 'TX-811-2025-12345',
        requestDate: '2025-02-15',
        workType: 'New Installation',
        depth: '18 inches',
        method: 'Open Cut'
      }
    }
  });

  console.log('✅ Created ticket:', ticket.ticketNumber);

  // Create permit for the ticket
  const permit = await prisma.permit.create({
    data: {
      ticketId: ticket.id,
      organizationId: organization.id,
      permitNumber: 'AUSTIN-2025-001',
      municipality: 'City of Austin',
      permitType: 'Right-of-Way Excavation',
      applicationData: {
        applicantName: 'Fiber Connect Solutions',
        workType: 'Utility Installation',
        trafficControlRequired: true,
        restorationMethod: 'Full Depth Replacement'
      },
      prefilledData: {
        applicantName: ticket.excavatorName,
        applicantPhone: ticket.excavatorPhone,
        workAddress: ticket.workAddress,
        workDescription: ticket.workDescription,
        estimatedCost: '$2,500',
        municipality: 'City of Austin',
        permitType: 'Right-of-Way Excavation'
      },
      fee: 75.00,
      status: 'APPROVED',
      submittedAt: new Date('2025-02-20'),
      approvedAt: new Date('2025-02-25')
    }
  });

  console.log('✅ Created permit:', permit.permitNumber);

  // Create traffic plan
  const trafficPlan = await prisma.trafficPlan.create({
    data: {
      ticketId: ticket.id,
      organizationId: organization.id,
      templateId: 'residential-street-v1',
      templateName: 'Residential Street Template',
      generatedData: {
        streetType: 'Residential',
        laneConfiguration: '2-lane',
        trafficDevices: ['Cones', 'Warning Signs', 'Flaggers'],
        workZoneLength: '200 feet'
      },
      pdfPath: '/storage/traffic-plans/tx-811-2025-12345-traffic-plan.pdf'
    }
  });

  console.log('✅ Created traffic plan');

  // Create inspection
  const inspection = await prisma.inspection.create({
    data: {
      ticketId: ticket.id,
      permitId: permit.id,
      organizationId: organization.id,
      inspectionType: 'Pre-Construction',
      scheduledDate: new Date('2025-03-01'),
      scheduledTime: '10:00 AM',
      inspector: 'City Inspector John Smith',
      inspectorContact: '(512) 974-1234',
      status: 'SCHEDULED',
      calendarEventId: 'cal-event-12345'
    }
  });

  console.log('✅ Created inspection');

  // Create evidence
  const evidence = await prisma.evidence.create({
    data: {
      ticketId: ticket.id,
      organizationId: organization.id,
      userId: users[1].id, // Field supervisor
      type: EvidenceType.LOCATE_PROOF,
      title: 'Pre-work utility locates verification',
      description: 'Photo showing all utilities properly marked before excavation',
      filePath: '/storage/evidence/locate-proof-001.jpg',
      fileType: 'image/jpeg',
      fileSize: 2048576,
      gpsLatitude: 30.2672,
      gpsLongitude: -97.7431,
      capturedAt: new Date('2025-02-28')
    }
  });

  console.log('✅ Created evidence');

  // Create fee
  const fee = await prisma.fee.create({
    data: {
      ticketId: ticket.id,
      organizationId: organization.id,
      type: 'PERMIT_FEE',
      description: 'Right-of-Way Excavation Permit Fee',
      amount: 75.00,
      dueDate: new Date('2025-03-01'),
      paidDate: new Date('2025-02-28'),
      paidAmount: 75.00,
      status: 'PAID',
      referenceNumber: 'PAY-AUSTIN-001'
    }
  });

  console.log('✅ Created fee');

  // Create audit logs
  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        ticketId: ticket.id,
        organizationId: organization.id,
        userId: users[0].id, // Permit coordinator
        action: 'TICKET_CREATED',
        entityType: 'TICKET',
        entityId: ticket.id,
        newData: { status: TicketStatus.INTAKE },
        timestamp: new Date('2025-02-15T09:00:00Z')
      }
    }),
    prisma.auditLog.create({
      data: {
        ticketId: ticket.id,
        organizationId: organization.id,
        userId: users[0].id, // Permit coordinator
        action: 'PERMIT_CREATED',
        entityType: 'PERMIT',
        entityId: permit.id,
        newData: { permitNumber: permit.permitNumber, status: 'DRAFT' },
        timestamp: new Date('2025-02-20T10:30:00Z')
      }
    }),
    prisma.auditLog.create({
      data: {
        ticketId: ticket.id,
        organizationId: organization.id,
        userId: users[0].id, // Permit coordinator
        action: 'STATUS_UPDATED',
        entityType: 'TICKET',
        entityId: ticket.id,
        previousData: { status: TicketStatus.INTAKE },
        newData: { status: TicketStatus.PERMIT_FILED },
        timestamp: new Date('2025-02-20T14:15:00Z')
      }
    })
  ]);

  console.log('✅ Created audit logs');

  // Create a second ticket for more test data
  const ticket2 = await prisma.ticket.create({
    data: {
      organizationId: organization.id,
      ticketNumber: 'TX-811-2025-12346',
      source: '811',
      status: TicketStatus.INTAKE,
      excavatorName: 'Metro Water Services',
      excavatorPhone: '(512) 555-0400',
      excavatorEmail: 'dispatch@metrowater.com',
      workAddress: '456 Oak Avenue, Austin, TX 78702',
      latitude: 30.2849,
      longitude: -97.7341,
      utilityTypes: [UtilityType.WATER, UtilityType.SEWER],
      workStartDate: new Date('2025-03-10'),
      workEndDate: new Date('2025-03-12'),
      workDescription: 'Emergency water main repair due to leak detected during routine inspection.',
      emergencyContact: '(512) 555-0401',
      rawData: {
        originalTicket: 'TX-811-2025-12346',
        requestDate: '2025-02-18',
        workType: 'Emergency Repair',
        priority: 'High'
      }
    }
  });

  console.log('✅ Created second ticket:', ticket2.ticketNumber);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Users Created:');
  console.log('Email: coordinator@austinutils.com | Password: password123 | Role: Permit Coordinator');
  console.log('Email: supervisor@austinutils.com | Password: password123 | Role: Field Supervisor');
  console.log('Email: compliance@austinutils.com | Password: password123 | Role: Compliance Manager');
  console.log('\n🎫 Test Tickets:');
  console.log('- TX-811-2025-12345 (Fiber installation - with permit and inspection)');
  console.log('- TX-811-2025-12346 (Water main repair - new intake)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });