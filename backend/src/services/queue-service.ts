import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
});

export interface TicketProcessingJob {
  ticketId: string;
  organizationId: string;
  rawData: any;
}

export interface PermitPrefillJob {
  ticketId: string;
  municipality: string;
  permitType: string;
}

export interface TrafficPlanGenerationJob {
  ticketId: string;
  templateId: string;
}

export interface InspectionSchedulingJob {
  ticketId: string;
  permitId?: string;
  inspectionType: string;
  preferredDate: Date;
}

export interface CloseoutProcessingJob {
  ticketId: string;
  userId: string;
}

// Queue definitions
export const ticketProcessingQueue = new Queue('ticket-processing', { connection });
export const permitPrefillQueue = new Queue('permit-prefill', { connection });
export const trafficPlanQueue = new Queue('traffic-plan-generation', { connection });
export const inspectionQueue = new Queue('inspection-scheduling', { connection });
export const closeoutQueue = new Queue('closeout-processing', { connection });

export const initializeQueues = async () => {
  // Set up workers
  const ticketWorker = new Worker('ticket-processing', async (job: Job<TicketProcessingJob>) => {
    const { ticketId, organizationId, rawData } = job.data;
    
    // Process 811 ticket data
    console.log(`Processing ticket ${ticketId} for organization ${organizationId}`);
    
    // Parse and validate ticket data
    // Update ticket status
    // Trigger permit prefill if needed
    
    return { processed: true, ticketId };
  }, { connection });

  const permitWorker = new Worker('permit-prefill', async (job: Job<PermitPrefillJob>) => {
    const { ticketId, municipality, permitType } = job.data;
    
    // Use AI to prefill permit application
    console.log(`Prefilling permit for ticket ${ticketId} in ${municipality}`);
    
    // Generate permit application data
    // Save prefilled permit
    
    return { prefilled: true, ticketId };
  }, { connection });

  const trafficPlanWorker = new Worker('traffic-plan-generation', async (job: Job<TrafficPlanGenerationJob>) => {
    const { ticketId, templateId } = job.data;
    
    // Generate traffic control plan
    console.log(`Generating traffic plan for ticket ${ticketId} using template ${templateId}`);
    
    // Apply template and generate PDF
    
    return { generated: true, ticketId };
  }, { connection });

  const inspectionWorker = new Worker('inspection-scheduling', async (job: Job<InspectionSchedulingJob>) => {
    const { ticketId, permitId, inspectionType, preferredDate } = job.data;
    
    // Schedule inspection with municipality
    console.log(`Scheduling ${inspectionType} inspection for ticket ${ticketId}`);
    
    // Call municipal API
    // Create calendar event
    
    return { scheduled: true, ticketId };
  }, { connection });

  const closeoutWorker = new Worker('closeout-processing', async (job: Job<CloseoutProcessingJob>) => {
    const { ticketId, userId } = job.data;
    
    // Process ticket closeout
    console.log(`Processing closeout for ticket ${ticketId}`);
    
    // Generate closeout package
    // Submit to municipal portal
    // Update fees and status
    
    return { closed: true, ticketId };
  }, { connection });

  // Handle worker events
  const workers = [ticketWorker, permitWorker, trafficPlanWorker, inspectionWorker, closeoutWorker];
  
  workers.forEach(worker => {
    worker.on('completed', (job) => {
      console.log(`Job ${job.name} completed for ${job.data}`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job?.name} failed:`, err);
    });
  });

  return {
    ticketProcessingQueue,
    permitPrefillQueue,
    trafficPlanQueue,
    inspectionQueue,
    closeoutQueue
  };
};

// Helper functions for adding jobs
export const addTicketProcessingJob = async (data: TicketProcessingJob) => {
  return await ticketProcessingQueue.add('process-ticket', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};

export const addPermitPrefillJob = async (data: PermitPrefillJob) => {
  return await permitPrefillQueue.add('prefill-permit', data, {
    attempts: 2,
    delay: 5000, // Wait 5 seconds to ensure ticket is processed
  });
};

export const addTrafficPlanJob = async (data: TrafficPlanGenerationJob) => {
  return await trafficPlanQueue.add('generate-traffic-plan', data);
};

export const addInspectionJob = async (data: InspectionSchedulingJob) => {
  return await inspectionQueue.add('schedule-inspection', data);
};

export const addCloseoutJob = async (data: CloseoutProcessingJob) => {
  return await closeoutQueue.add('process-closeout', data);
};