# Deployment Guide

## Production Deployment

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- S3-compatible storage (AWS S3, MinIO, etc.)

### Environment Variables

#### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/utility_copilot?schema=public"

# JWT
JWT_SECRET="your-production-jwt-secret-key"

# Redis
REDIS_URL="redis://host:6379"

# API
PORT=8000
HOST=0.0.0.0
NODE_ENV=production
LOG_LEVEL=info

# Frontend
FRONTEND_URL="https://your-domain.com"

# File Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=utility-copilot-files
S3_ENDPOINT=https://s3.amazonaws.com

# External Services
OPENAI_API_KEY=your-openai-api-key

# 811 Integration
MOCK_811_API_URL=https://811-api.example.com
```

#### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
```

### Build Steps

1. **Build shared package:**
   ```bash
   cd shared && npm run build
   ```

2. **Build backend:**
   ```bash
   cd backend && npm run build
   ```

3. **Build frontend:**
   ```bash
   cd frontend && npm run build
   ```

### Database Setup

1. **Run migrations:**
   ```bash
   cd backend && npx prisma migrate deploy
   ```

2. **Seed production data (optional):**
   ```bash
   cd backend && npm run db:seed
   ```

### Docker Deployment

Use the provided `docker-compose.yml` as a starting point for production deployment. You'll need to:

1. Create production-ready Dockerfiles
2. Configure environment variables
3. Set up proper volumes and networking
4. Configure SSL/TLS termination
5. Set up backup strategies

### Health Checks

- Backend health: `GET /health`
- Database connectivity check via Prisma
- Redis connectivity check via BullMQ

### Monitoring

Consider implementing:
- Application performance monitoring (APM)
- Log aggregation (ELK stack, Fluentd)
- Metrics collection (Prometheus, Grafana)
- Error tracking (Sentry)

### Security Considerations

1. **JWT Security:**
   - Use strong secret keys
   - Set appropriate expiration times
   - Consider refresh token implementation

2. **Database Security:**
   - Use connection pooling
   - Enable SSL connections
   - Regular backups

3. **API Security:**
   - Rate limiting (already configured)
   - CORS configuration
   - Input validation
   - SQL injection prevention (Prisma ORM)

4. **File Storage:**
   - Secure S3 bucket policies
   - Virus scanning for uploads
   - File type validation

### Scaling Considerations

1. **Database:**
   - Read replicas for reporting
   - Connection pooling
   - Query optimization

2. **Background Jobs:**
   - Multiple worker instances
   - Queue monitoring
   - Dead letter queues

3. **Caching:**
   - Redis for session storage
   - Application-level caching
   - CDN for static assets

### Backup Strategy

1. **Database Backups:**
   - Daily automated backups
   - Point-in-time recovery
   - Test restore procedures

2. **File Storage:**
   - Cross-region replication
   - Versioning enabled
   - Lifecycle policies