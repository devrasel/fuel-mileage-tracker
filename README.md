# mileage-tracker
Mileage Tracker Next JS app (For multiple bike, check cost, fuel usage and mileage etc)


## Install dependencies
npm install


## Check the registration API file
cat src/app/api/auth/register/route.ts

## Test the registration endpoint
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

/***  this is the most important part 



## Create environment file
cat > .env << EOF
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV=development
EOF

## Create database directory
mkdir -p db

## Setup database
npm run db:push

## Generate Prisma client
npm run db:generate

/****


## Check if database file exists
ls -la db/

## Check database tables
sqlite3 db/custom.db ".tables"

## Check if any users exist
sqlite3 db/custom.db "SELECT * FROM User;"


