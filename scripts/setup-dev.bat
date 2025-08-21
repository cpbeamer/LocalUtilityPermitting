@echo off
echo 🚀 Setting up Utility Permitting Copilot development environment...

echo 📦 Starting PostgreSQL, Redis, and MinIO...
docker-compose up -d postgres redis minio

echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak > nul

echo 📥 Installing dependencies...
npm install

echo 🔨 Building shared package...
cd shared && npm run build && cd ..

echo 📥 Installing backend dependencies...
cd backend && npm install && cd ..

echo 📥 Installing frontend dependencies...
cd frontend && npm install && cd ..

echo 🗄️ Generating Prisma client...
cd backend && npx prisma generate

echo 🗄️ Running database migrations...
cd backend && npx prisma db push

echo 🌱 Seeding database with test data...
cd backend && npm run db:seed

echo ✅ Development environment setup complete!
echo.
echo 🎯 Next steps:
echo 1. Start the backend: cd backend && npm run dev
echo 2. Start the frontend: cd frontend && npm run dev
echo 3. Visit http://localhost:3000 to access the app
echo.
echo 📋 Demo login credentials:
echo - Permit Coordinator: coordinator@austinutils.com / password123
echo - Field Supervisor: supervisor@austinutils.com / password123
echo - Compliance Manager: compliance@austinutils.com / password123
echo.
echo 🔧 Additional services:
echo - API Documentation: http://localhost:8000/docs
echo - Queue Dashboard: http://localhost:8000/admin/queues
echo - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)

pause