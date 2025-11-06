// MongoDB Migration Script
// This script renames the database from 'careerconnect' to 'saarthix'
// Run this script using: mongosh < migrate-database.js
// Or connect to MongoDB and paste the commands

// Connect to the database (adjust connection string if needed)
// For Docker: mongodb://localhost:27017
// For local MongoDB: mongodb://localhost:27017

// Check if careerconnect database exists
var sourceDB = db.getSiblingDB('careerconnect');
var targetDB = db.getSiblingDB('saarthix');

print('Checking if careerconnect database exists...');
var collections = sourceDB.getCollectionNames();

if (collections.length === 0) {
    print('No collections found in careerconnect database. It may not exist or is empty.');
    print('The application will create the saarthix database automatically on first use.');
} else {
    print('Found ' + collections.length + ' collections in careerconnect database.');
    print('Collections: ' + collections.join(', '));
    
    // Copy all collections from careerconnect to saarthix
    collections.forEach(function(collectionName) {
        print('Copying collection: ' + collectionName);
        var sourceCollection = sourceDB.getCollection(collectionName);
        var targetCollection = targetDB.getCollection(collectionName);
        
        // Copy all documents
        sourceCollection.find().forEach(function(doc) {
            targetCollection.insertOne(doc);
        });
        
        print('Copied ' + sourceCollection.countDocuments() + ' documents from ' + collectionName);
    });
    
    print('\nMigration completed successfully!');
    print('All collections have been copied from careerconnect to saarthix.');
    print('You can now delete the careerconnect database if you want:');
    print('  db.getSiblingDB("careerconnect").dropDatabase()');
}

