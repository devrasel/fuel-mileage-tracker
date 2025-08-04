# Fuel Mileage Tracker - Setup Guide

## Project Files Available

### Option A: Complete Source Archive (156KB)
- File: `project-source-only.tar.gz`
- Contains: All source code files, no node_modules or build files
- Best for: Fresh installation

### Option B: Essential Files Archive (325KB) 
- File: `fuel-mileage-tracker-essential.tar.gz`
- Contains: Source code + database file + dependencies
- Best for: Ready to run with your data

### Option C: Individual Files
All files are available in the `/home/z/my-project/download/` directory

## Quick Setup Instructions

### If you have Option A (source-only):
```bash
# 1. Extract the archive
tar -xzf project-source-only.tar.gz
cd project-directory

# 2. Install dependencies
npm install

# 3. Set up database
npx prisma generate
npx prisma db push

# 4. Start development server
npm run dev
```

### If you have Option B (essential files):
```bash
# 1. Extract the archive
tar -xzf fuel-mileage-tracker-essential.tar.gz
cd download

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Start development server
npm run dev
```

## Project Structure

```
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/            # API routes
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main page
│   ├── components/         # React components
│   │   ├── ui/            # Shadcn UI components
│   │   └── *.tsx          # Custom components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility libraries
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── public/                # Static assets
├── db/
│   └── custom.db         # SQLite database file
├── package.json           # Project dependencies
├── tailwind.config.ts     # Tailwind CSS config
├── tsconfig.json         # TypeScript config
└── next.config.ts       # Next.js config
```

## Database Information

- **Type**: SQLite
- **File**: `db/custom.db`
- **Size**: ~72KB
- **Contains**: All your fuel entries, vehicles, maintenance costs, and settings

## Accessing Your Data

To view your SQLite database:
1. Download DB Browser for SQLite (https://sqlitebrowser.org/)
2. Open the `custom.db` file
3. Browse tables: Vehicle, FuelEntry, MaintenanceCost, Settings

## Running the Application

After setup:
```bash
npm run dev
```

The application will be available at:
- Local: http://localhost:3000
- Network: http://your-ip:3000

## Features Included

✅ Fuel entry tracking with full/partial fill-ups
✅ Maintenance cost tracking
✅ Vehicle management
✅ Statistics and monthly reports
✅ Responsive design for mobile/desktop
✅ Dark mode support
✅ Data export/import capabilities
✅ Mileage efficiency ratings (Excellent/Medium/Low)

## Dependencies

Key technologies used:
- Next.js 15.3.5 (React framework)
- TypeScript
- Prisma ORM
- SQLite database
- Tailwind CSS
- Shadcn UI components
- Lucide React icons

## Troubleshooting

If you encounter any issues:
1. Ensure Node.js is installed (v18+ recommended)
2. Run `npm install` to install all dependencies
3. Run `npx prisma generate` to generate Prisma client
4. Check that the database file `custom.db` is present
5. Verify the `.env` file has the correct DATABASE_URL

## Support

If you need help with the project, refer to the source code comments or reach out for assistance.