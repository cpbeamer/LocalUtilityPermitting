# Utility Locate & Municipal Permitting Copilot

MVP web application that automates 811 ticket intake and municipal ROW permitting for contractors.

## 🎯 Goals

- Ingest 811 locate tickets, parse into structured jobs
- Auto-prefill municipal permit applications
- Generate traffic control plans from templates
- Schedule inspections with agencies; notify supervisors
- Capture field photos/as-builts, tie back to permits
- Submit closeouts, reconcile fees, and track fines
- Immutable audit trail

## 🏗️ Project Structure

```
├── frontend/          # Next.js + React + TypeScript frontend
├── backend/           # Node.js + Fastify backend API
├── shared/            # Shared types and utilities
├── docs/              # Documentation
├── scripts/           # Setup and deployment scripts
└── docker-compose.yml # Development infrastructure
```

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Fastify, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Jobs**: Redis + BullMQ
- **Storage**: S3-compatible storage (MinIO for development)
- **Auth**: JWT with RBAC

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
.\scripts\setup-dev.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

### Option 2: Manual Setup

1. **Start infrastructure services:**
   ```bash
   docker-compose up -d postgres redis minio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd shared && npm run build && cd ..
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   ```

3. **Set up database:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npm run db:seed
   cd ..
   ```

4. **Start development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend  
   cd frontend && npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8000/docs
   - Queue Dashboard: http://localhost:8000/admin/queues

## 👤 Demo Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Permit Coordinator | coordinator@austinutils.com | password123 | Manage permits and submissions |
| Field Supervisor | supervisor@austinutils.com | password123 | Handle field operations |
| Compliance Manager | compliance@austinutils.com | password123 | Oversee compliance and fees |

## 🎯 Core Features

### ✅ Implemented
- **Authentication & RBAC**: Multi-tenant with role-based permissions
- **811 Ticket Intake**: Parse and store ticket data from 811 systems
- **Permit Prefill**: AI-powered form completion for municipal permits
- **Dashboard**: Real-time overview of tickets, permits, and inspections
- **Audit Trail**: Immutable logging of all system actions
- **API Documentation**: Auto-generated Swagger/OpenAPI docs

### 🚧 MVP Scope (Stub Implementation)
- **Traffic Control Plans**: Template-based plan generation
- **Inspection Scheduling**: Municipal API integration
- **Field Evidence**: Photo/document upload with GPS
- **Closeout Processing**: Bundle submission to municipal portals
- **Fee Management**: Track and reconcile permit fees

## 📊 Database Schema

Key entities:
- **Organizations**: Multi-tenant structure
- **Users**: Role-based access control
- **Tickets**: 811 ticket data and status
- **Permits**: Municipal permit applications
- **TrafficPlans**: Generated control plans
- **Inspections**: Scheduled municipal inspections
- **Evidence**: Field photos and documentation
- **Fees**: Permit costs and payments
- **AuditLogs**: Immutable action tracking

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user profile

### Tickets
- `POST /api/tickets/import` - Import 811 ticket
- `GET /api/tickets` - List tickets with filtering
- `GET /api/tickets/:id` - Get ticket details
- `PATCH /api/tickets/:id/status` - Update status
- `GET /api/tickets/dashboard/summary` - Dashboard data

### Permits
- `POST /api/permits/prefill` - AI prefill permit
- `GET /api/permits` - List permits
- `PATCH /api/permits/:id` - Update permit data
- `POST /api/permits/:id/submit` - Submit to municipality

### Audit
- `GET /api/audit/:ticketId` - Get audit trail
- `GET /api/audit/:ticketId/export` - Export audit package

## 🧪 End-to-End Workflow

1. **811 Ticket Import** → System parses ticket data
2. **Permit Prefill** → AI fills municipal form templates  
3. **Traffic Plan** → Generate from street type template
4. **Inspection Scheduling** → Request municipal inspection
5. **Field Evidence** → Upload photos with GPS coordinates
6. **Closeout Submission** → Bundle all documents for municipality
7. **Fee Reconciliation** → Track payments and outstanding balances
8. **Audit Export** → Complete paper trail for compliance

## 🔐 Security Features

- JWT authentication with role-based access
- Field-level encryption for PII
- Rate limiting and CORS protection
- Input validation with Zod schemas
- SQL injection prevention via Prisma ORM

## 📈 Monitoring & Observability

- Health check endpoints
- Queue monitoring dashboard
- Structured logging with Pino
- Background job processing with BullMQ

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- Interactive API docs at `/docs` when running

## 🏃‍♂️ Development

### Available Scripts

**Root:**
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Lint all packages

**Backend:**
- `npm run dev` - Start development server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed test data
- `npm run db:studio` - Open Prisma Studio

**Frontend:**
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## 🌊 Queue Processing

Background jobs handled by BullMQ:
- Ticket processing and validation
- Permit prefill with AI integration
- Traffic plan generation
- Inspection scheduling
- Closeout processing

Monitor at: http://localhost:8000/admin/queues

## 📦 Infrastructure Services

Development environment includes:
- **PostgreSQL** (port 5432) - Main database
- **Redis** (port 6379) - Job queue and caching
- **MinIO** (port 9000/9001) - S3-compatible storage

## 🎨 Frontend Features

- Responsive design with Tailwind CSS
- Real-time dashboard with key metrics
- Role-based UI components
- Form validation and error handling
- Loading states and user feedback

## 🔄 State Management

- React Context for authentication
- Axios interceptors for API calls
- Local storage for JWT persistence
- Error boundaries for graceful failures

## 🌍 Environment Configuration

See `.env.example` files for required environment variables.

Key configurations:
- Database connection strings
- JWT secrets
- External API keys (OpenAI, 811 systems)
- File storage credentials

This MVP provides a solid foundation for a production utility permitting system with proper authentication, data modeling, API design, and modern development practices.