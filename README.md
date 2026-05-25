# My MVP App

Angular + NestJS full-stack application

## Setup

### Prerequisites
- Node.js 18.19+ or 20.9+
- Docker (for PostgreSQL)

### Installation

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Start database
docker-compose up -d

# Run migrations
cd backend && npx prisma migrate dev

# Start backend
npm run start:dev

# In another terminal, start frontend
cd frontend && npm start
```

## Project Structure

```
my-mvp-app/
├── frontend/          # Angular application
├── backend/           # NestJS application
├── docs/              # Documentation
└── docker-compose.yml # Database setup
```