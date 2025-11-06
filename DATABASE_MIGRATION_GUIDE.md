# Database Migration Guide - CareerConnect to SaarthiX

This guide will help you migrate your MongoDB database from `careerconnect` to `saarthix`.

## Important Notes

- The application is now configured to use the `saarthix` database
- If you have existing data in the `careerconnect` database, you need to migrate it
- MongoDB is running inside Docker (as per your setup)

## Option 1: Automatic Migration (Recommended)

### For Windows PowerShell:
1. Make sure your Docker containers are running:
   ```powershell
   docker-compose ps
   ```

2. Navigate to the backend directory:
   ```powershell
   cd backend
   ```

3. Run the migration script:
   ```powershell
   .\migrate-database.ps1
   ```

### For Linux/Mac:
1. Make sure your Docker containers are running:
   ```bash
   docker-compose ps
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Make the script executable:
   ```bash
   chmod +x migrate-database.sh
   ```

4. Run the migration script:
   ```bash
   ./migrate-database.sh
   ```

## Option 2: Manual Migration using mongosh

1. Connect to MongoDB running in Docker:
   ```bash
   mongosh mongodb://localhost:27017
   ```

2. Run the migration commands manually:
   ```javascript
   // Switch to careerconnect database
   use careerconnect
   
   // Get list of collections
   show collections
   
   // Copy each collection to saarthix database
   // Example for users collection:
   db.users.find().forEach(function(doc) {
       db.getSiblingDB('saarthix').users.insertOne(doc);
   });
   
   // Repeat for all collections:
   // - users
   // - jobs
   // - resumes
   // - resume_templates
   // - review_requests
   // - blueprints
   // - trainings
   // - training_enrollments
   // - courses
   // - institutes
   // - interviews
   // - industryPostings
   ```

3. Verify the migration:
   ```javascript
   use saarthix
   show collections
   // Check that all collections are present
   ```

4. (Optional) Delete the old database:
   ```javascript
   use careerconnect
   db.dropDatabase()
   ```

## Option 3: Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to the `careerconnect` database
4. For each collection:
   - Click on the collection
   - Use the "Export Collection" feature
   - Switch to the `saarthix` database (create it if it doesn't exist)
   - Use "Import Data" to import the exported collection

## Verification

After migration, verify that:
1. All collections are present in the `saarthix` database
2. Document counts match between old and new databases
3. The application connects successfully (check logs)

## If Starting Fresh

If you don't have any important data in the `careerconnect` database, you can simply:
1. Delete the old database (if you want)
2. Let the application create the new `saarthix` database automatically on first run

The application will create the database and collections automatically when you first start using it.

## Troubleshooting

### Connection Issues
- Make sure Docker containers are running: `docker-compose ps`
- Verify MongoDB is accessible: `mongosh mongodb://localhost:27017`
- Check application logs for connection errors

### Data Not Appearing
- Verify the database name in `application.properties` is `saarthix`
- Check that collections exist in the `saarthix` database
- Restart the backend service after migration

### Migration Script Fails
- Make sure `mongosh` is installed and in your PATH
- Try running the JavaScript commands manually in mongosh
- Check MongoDB logs for errors

