#!/bin/bash
# MongoDB Migration Script for Linux/Mac
# This script helps migrate data from 'careerconnect' to 'saarthix' database

echo "MongoDB Database Migration Script"
echo "==================================="
echo ""
echo "This script will help you migrate data from 'careerconnect' to 'saarthix' database"
echo ""

# Check if mongosh is available
if ! command -v mongosh &> /dev/null; then
    echo "Error: mongosh is not installed or not in PATH"
    echo "Please install MongoDB Shell (mongosh) first"
    exit 1
fi

echo "Connecting to MongoDB..."
echo "If you're using Docker, connect to: mongodb://localhost:27017"
echo ""

# Execute the migration
mongosh mongodb://localhost:27017 --quiet < migrate-database.js

echo ""
echo "Migration script completed!"
echo "Please verify the data in the 'saarthix' database"

