# Database Setup - PostgreSQL

## Prerequisites
- PostgreSQL installed and running
- Node.js and npm installed

## Setup Instructions

### 1. Environment Configuration
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your PostgreSQL credentials:
   ```env
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=ekin_backend_db
   ```

### 2. Database Creation
Create the database in PostgreSQL:
```sql
CREATE DATABASE ekin_backend_db;
```

### 3. Running the Application
```bash
npm run start:dev
```

## Database Configuration

The database configuration is managed through:
- `src/config/database.config.ts` - Database connection settings
- `src/config/app.config.ts` - Application settings
- `src/entities/` - TypeORM entities

## Features
- TypeORM integration with PostgreSQL
- Environment-based configuration
- Auto-synchronization in development mode
- SSL support for production
- Logging enabled in development

## Sample Entity
A sample `User` entity is provided in `src/entities/user.entity.ts` to demonstrate the database integration.

## Migration (Future Enhancement)
For production, consider using TypeORM migrations instead of synchronization:
```bash
npm run typeorm:migration:generate -- -n InitialMigration
npm run typeorm:migration:run
```