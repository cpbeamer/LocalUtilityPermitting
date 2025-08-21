#!/bin/bash

echo "🚀 Setting up Utility Permitting Copilot development environment..."

# Start infrastructure services
echo "📦 Starting PostgreSQL, Redis, and MinIO..."
docker-compose up -d postgres redis minio

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Build shared package
echo "🔨 Building shared package..."
cd shared && npm run build && cd ..

# Install backend dependencies
echo "📥 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies  
echo "📥 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd backend && npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
cd backend && npx prisma db push

# Seed the database
echo "🌱 Seeding database with test data..."
cd backend && npm run db:seed

echo "✅ Development environment setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start the backend: cd backend && npm run dev"
echo "2. Start the frontend: cd frontend && npm run dev"
echo "3. Visit http://localhost:3000 to access the app"
echo ""
echo "📋 Demo login credentials:"
echo "- Permit Coordinator: coordinator@austinutils.com / password123"
echo "- Field Supervisor: supervisor@austinutils.com / password123"
echo "- Compliance Manager: compliance@austinutils.com / password123"
echo ""
echo "🔧 Additional services:"
echo "- API Documentation: http://localhost:8000/docs"
echo "- Queue Dashboard: http://localhost:8000/admin/queues"
echo "- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"