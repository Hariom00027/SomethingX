// Script to seed training data
// Run this with: node seed-training-data.js
// Make sure the backend server is running on http://localhost:8080

const fs = require('fs');
const path = require('path');
const http = require('http');

const trainingDataPath = path.join(__dirname, 'src/main/resources/training-data.json');
const trainingData = JSON.parse(fs.readFileSync(trainingDataPath, 'utf8'));

const postData = JSON.stringify(trainingData);

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/trainings/seed',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
    try {
      const result = JSON.parse(data);
      console.log(`Successfully seeded ${result.inserted} training(s). Total: ${result.total}`);
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  console.error('Make sure the backend server is running on http://localhost:8080');
});

req.write(postData);
req.end();

