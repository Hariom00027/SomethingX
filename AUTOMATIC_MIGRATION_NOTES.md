# Automatic Database Migration

## Overview

The application now includes **automatic database migration** that runs on startup. When you pull the latest code and start the application, it will automatically:

1. ✅ Check if the `careerconnect` database exists
2. ✅ If it exists, migrate all collections and data to `saarthix`
3. ✅ Skip migration if data already exists in `saarthix` (idempotent)
4. ✅ Create the `saarthix` database automatically if it doesn't exist

## How It Works

The `DatabaseMigrationService` class implements `ApplicationRunner` and runs automatically when the Spring Boot application starts.

### Migration Process

1. **Checks for source database**: Looks for `careerconnect` database
2. **Lists collections**: Gets all collections from the source database
3. **Checks each collection**: 
   - Skips empty collections
   - Skips collections that already exist in `saarthix` (prevents duplicates)
4. **Migrates data**: Copies all documents from source to target collection
5. **Logs progress**: Provides detailed logging of the migration process

### Safety Features

- ✅ **Idempotent**: Safe to run multiple times - won't duplicate data
- ✅ **Non-blocking**: Migration errors won't prevent application startup
- ✅ **Smart skipping**: Only migrates collections that don't already exist in target
- ✅ **Detailed logging**: Full migration report in application logs

## What Your Coworkers Need to Do

**Nothing!** 🎉

When they pull the code and start the application:

1. The application will automatically detect the `careerconnect` database
2. All data will be migrated to `saarthix` automatically
3. They'll see migration logs in the console/application logs
4. The application will continue running normally

## Logs to Look For

When the application starts, you'll see logs like:

```
INFO  - Checking for database migration from 'careerconnect' to 'saarthix'...
INFO  - Current database: saarthix
INFO  - Found 9 collections in 'careerconnect' database. Starting migration...
INFO  - Migrating collection 'users' (1 documents)...
INFO  - Successfully migrated collection 'users': 1 documents
...
INFO  - ===========================================
INFO  - Database migration completed successfully!
INFO  - Collections migrated: 9
INFO  - Total documents migrated: 353
INFO  - ===========================================
```

Or if migration isn't needed:

```
INFO  - No 'careerconnect' database found. Migration not needed.
```

Or if data already exists:

```
INFO  - Collection 'users' already exists in 'saarthix' with 2 documents. Skipping migration.
```

## Troubleshooting

### Migration doesn't run
- Check application logs for any errors
- Verify MongoDB is accessible
- Ensure the `careerconnect` database exists (if it should)

### Migration fails
- Check MongoDB connection string in `application.properties`
- Verify MongoDB container is running: `docker-compose ps`
- Check application logs for specific error messages
- The application will still start even if migration fails (non-blocking)

### Data appears duplicated
- The migration is idempotent and should prevent duplicates
- If you see duplicates, check the logs to see what happened
- You may need to manually clean up duplicates

## Manual Migration (If Needed)

If automatic migration doesn't work for some reason, you can still use the manual migration scripts:

- `backend/migrate-database.js` - JavaScript migration script
- `backend/migrate-database.ps1` - Windows PowerShell script
- `backend/migrate-database.sh` - Linux/Mac script

See `DATABASE_MIGRATION_GUIDE.md` for manual migration instructions.

