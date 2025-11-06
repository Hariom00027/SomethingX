// MongoDB Migration Script - Copy all data from careerconnect to saarthix
// This script copies all collections from careerconnect database to saarthix database

print('Starting database migration from careerconnect to saarthix...');
print('');

// Source and target databases
var sourceDB = db.getSiblingDB('careerconnect');
var targetDB = db.getSiblingDB('saarthix');

// Get all collections from source database
var collections = sourceDB.getCollectionNames();

if (collections.length === 0) {
    print('No collections found in careerconnect database.');
    print('Migration complete.');
} else {
    print('Found ' + collections.length + ' collections to migrate:');
    collections.forEach(function(col) {
        print('  - ' + col);
    });
    print('');
    
    var totalDocuments = 0;
    
    // Copy each collection
    collections.forEach(function(collectionName) {
        print('Migrating collection: ' + collectionName);
        
        var sourceCollection = sourceDB.getCollection(collectionName);
        var targetCollection = targetDB.getCollection(collectionName);
        
        // Count documents in source
        var sourceCount = sourceCollection.countDocuments();
        print('  Source documents: ' + sourceCount);
        
        if (sourceCount > 0) {
            // Copy all documents
            var copied = 0;
            sourceCollection.find().forEach(function(doc) {
                try {
                    targetCollection.insertOne(doc);
                    copied++;
                } catch (e) {
                    // If document already exists (duplicate key), skip it
                    if (e.code !== 11000) {
                        print('  Warning: Error copying document: ' + e.message);
                    }
                }
            });
            
            print('  Copied documents: ' + copied);
            totalDocuments += copied;
        } else {
            print('  No documents to copy');
        }
        
        print('');
    });
    
    print('========================================');
    print('Migration completed successfully!');
    print('Total documents migrated: ' + totalDocuments);
    print('========================================');
    print('');
    print('Verification:');
    
    // Verify migration
    collections.forEach(function(collectionName) {
        var sourceCount = sourceDB.getCollection(collectionName).countDocuments();
        var targetCount = targetDB.getCollection(collectionName).countDocuments();
        var status = sourceCount === targetCount ? '✓' : '✗';
        print(status + ' ' + collectionName + ': ' + targetCount + ' / ' + sourceCount);
    });
}

