# API Documentation

## Authentication

All API endpoints require authentication except for the login endpoint. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "coordinator@austinutils.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "coordinator@austinutils.com",
      "name": "Sarah Johnson",
      "role": "PERMIT_COORDINATOR",
      "organizationId": "uuid",
      "organization": {
        "id": "uuid",
        "name": "Austin Utility Contractors",
        "code": "AUC"
      }
    }
  }
}
```

### Tickets

#### POST /api/tickets/import
Import an 811 ticket.

**Request:**
```json
{
  "source": "811",
  "payload": {
    "ticketNumber": "TX-811-2025-12345",
    "requestDate": "2025-02-15",
    "workStartDate": "2025-03-01",
    "workEndDate": "2025-03-15",
    "excavatorCompany": "Fiber Connect Solutions",
    "excavatorContact": {
      "name": "John Smith",
      "phone": "(512) 555-0200",
      "email": "project@fiberconnect.com"
    },
    "workLocation": {
      "address": "123 Main Street",
      "city": "Austin",
      "state": "TX",
      "zip": "78701",
      "coordinates": {
        "latitude": 30.2672,
        "longitude": -97.7431
      }
    },
    "workDescription": "Installation of fiber optic cable",
    "utilityTypes": ["fiber", "electric"],
    "emergencyContact": "(512) 555-0300"
  }
}
```

#### GET /api/tickets
Get all tickets for the organization.

**Query Parameters:**
- `status`: Filter by ticket status
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

#### GET /api/tickets/:id
Get a specific ticket by ID.

#### PATCH /api/tickets/:id/status
Update ticket status.

**Request:**
```json
{
  "status": "PERMIT_FILED"
}
```

#### GET /api/tickets/dashboard/summary
Get dashboard summary data.

**Response:**
```json
{
  "success": true,
  "data": {
    "ticketsPending": 5,
    "permitsAwaitingApproval": 2,
    "inspectionsUpcoming": 3,
    "feesOutstanding": 1,
    "recentTickets": [...]
  }
}
```

### Permits

#### POST /api/permits/prefill
Prefill a permit application using AI.

**Request:**
```json
{
  "ticketId": "uuid",
  "municipality": "City of Austin",
  "permitType": "Right-of-Way Excavation"
}
```

#### GET /api/permits
Get all permits for the organization.

#### GET /api/permits/:id
Get a specific permit by ID.

#### PATCH /api/permits/:id
Update permit application data.

#### POST /api/permits/:id/submit
Submit permit to municipal authority.

### Audit

#### GET /api/audit/:ticketId
Get audit trail for a specific ticket.

#### GET /api/audit/:ticketId/export
Export complete audit package for a ticket.

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Error Format

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional validation details
}
```