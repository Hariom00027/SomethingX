package com.saarthix.service;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Automatic database migration service
 * Migrates data from 'careerconnect' to 'saarthix' database on application startup
 */
@Slf4j
@Service
public class DatabaseMigrationService implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;
    private final MongoClient mongoClient;

    @Autowired
    public DatabaseMigrationService(MongoTemplate mongoTemplate, MongoClient mongoClient) {
        this.mongoTemplate = mongoTemplate;
        this.mongoClient = mongoClient;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            log.info("Checking for database migration from 'careerconnect' to 'saarthix'...");
            migrateDatabase();
        } catch (Exception e) {
            log.error("Error during database migration: {}", e.getMessage(), e);
            // Don't fail the application startup if migration fails
        }
    }

    private void migrateDatabase() {
        try {
            // Get the current database name (should be 'saarthix')
            String currentDbName = mongoTemplate.getDb().getName();
            log.info("Current database: {}", currentDbName);

            // Check if 'careerconnect' database exists
            List<String> databaseNames = new ArrayList<>();
            mongoClient.listDatabaseNames().forEach(databaseNames::add);
            
            if (!databaseNames.contains("careerconnect")) {
                log.info("No 'careerconnect' database found. Migration not needed.");
                return;
            }

            // Get collections from careerconnect database
            MongoDatabase sourceDatabase = mongoClient.getDatabase("careerconnect");
            List<String> sourceCollections = new ArrayList<>();
            sourceDatabase.listCollectionNames().forEach(sourceCollections::add);

            if (sourceCollections.isEmpty()) {
                log.info("'careerconnect' database exists but has no collections. Migration not needed.");
                return;
            }

            log.info("Found {} collections in 'careerconnect' database. Starting migration...", 
                    sourceCollections.size());

            int totalMigrated = 0;
            int collectionsMigrated = 0;

            MongoDatabase targetDatabase = mongoClient.getDatabase("saarthix");

            for (String collectionName : sourceCollections) {
                try {
                    MongoCollection<Document> sourceCollection = sourceDatabase.getCollection(collectionName);
                    long sourceCount = sourceCollection.countDocuments();
                    
                    if (sourceCount == 0) {
                        log.debug("Skipping empty collection: {}", collectionName);
                        continue;
                    }

                    // Check if target collection already has data
                    MongoCollection<Document> targetCollection = targetDatabase.getCollection(collectionName);
                    long targetCount = targetCollection.countDocuments();
                    
                    if (targetCount > 0) {
                        log.info("Collection '{}' already exists in 'saarthix' with {} documents. Skipping migration.", 
                                collectionName, targetCount);
                        continue;
                    }

                    log.info("Migrating collection '{}' ({} documents)...", collectionName, sourceCount);

                    // Read all documents from source collection and insert into target
                    List<Document> documents = new ArrayList<>();
                    sourceCollection.find().forEach(documents::add);

                    if (!documents.isEmpty()) {
                        targetCollection.insertMany(documents);
                        long migratedCount = targetCollection.countDocuments();
                        totalMigrated += migratedCount;
                        collectionsMigrated++;

                        log.info("Successfully migrated collection '{}': {} documents", 
                                collectionName, migratedCount);
                    }

                } catch (Exception e) {
                    log.error("Error migrating collection '{}': {}", collectionName, e.getMessage(), e);
                }
            }

            if (collectionsMigrated > 0) {
                log.info("===========================================");
                log.info("Database migration completed successfully!");
                log.info("Collections migrated: {}", collectionsMigrated);
                log.info("Total documents migrated: {}", totalMigrated);
                log.info("===========================================");
            } else {
                log.info("No collections needed migration. All data already present in 'saarthix'.");
            }

        } catch (Exception e) {
            log.error("Error during database migration check: {}", e.getMessage(), e);
            // Don't throw - let the application continue even if migration fails
        }
    }
}

