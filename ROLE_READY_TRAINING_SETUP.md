# Role Ready Training Service - Setup Guide

## Overview
The Role Ready Training service allows students to browse and enroll in specialized training programs for various job roles.

## Features
- Browse training programs in a card-based layout
- View detailed training information including:
  - Role description
  - Industry, duration, fees, and location
  - Stipend information (if applicable)
  - Skills covered
  - Certification details
  - Package after training
- Enroll in training programs through a comprehensive enrollment form
- Share training catalog with institutes who can batch-enroll students

## Setup Instructions

### 1. Backend Setup
The backend endpoints are already set up in `TrainingController.java`:
- `GET /api/trainings` - Get all training programs
- `GET /api/trainings/{id}` - Get a specific training program
- `POST /api/trainings/{id}/enroll` - Enroll in a training program
- `POST /api/trainings/seed` - Seed training data

### 2. Seed Training Data

#### Option 1: Using the Node.js Script
1. Make sure the backend server is running on `http://localhost:8080`
2. Navigate to the backend directory:
   ```bash
   cd SomethingX/backend
   ```
3. Run the seed script:
   ```bash
   node seed-training-data.js
   ```

#### Option 2: Using curl
```bash
curl -X POST http://localhost:8080/api/trainings/seed \
  -H "Content-Type: application/json" \
  -d @src/main/resources/training-data.json
```

#### Option 3: Using Postman or any API client
- Method: POST
- URL: `http://localhost:8080/api/trainings/seed`
- Headers: `Content-Type: application/json`
- Body: Copy the contents from `backend/src/main/resources/training-data.json`

### 3. Frontend Setup
The frontend page is available at:
- Route: `/students/role-ready-training`
- Navigation: Students → Role Ready Training (in the navbar)

### 4. Access the Service
1. Start the backend server
2. Start the frontend server
3. Login as a student
4. Navigate to "Students" → "Role Ready Training" from the navbar
5. Browse available training programs and click "Enroll Now" to submit your details

### 5. Institute Batch Enrollment
- Route: `/institutes/student-training-role-ready`
- Institutes can open any training and enroll multiple students sequentially using `Save Data`, `Discard`, and `Add New Student` actions.
- Uses the same training catalog as the student-facing Role Ready Training page.

## Enrollment Form Fields

The enrollment form collects the following information:

### Personal Information
- Full Name (required)
- Email (required)
- Phone (required)
- Gender (required)
- Date of Birth (required)

### Address
- Address Line 1 (required)
- Address Line 2 (optional)
- City (required)
- State (required)
- Pincode (required)

### Education
- Highest Qualification (required)
- Specialization (optional)
- College Name (required)
- Graduation Year (optional)
- Percentage/CGPA (optional)

### Experience & Skills
- Years of Experience (optional)
- Known Skills (optional, comma-separated)

### Additional Information
- Resume URL (optional)
- Additional Notes (optional)

## Data Storage

- Training data is stored in MongoDB collection: `trainings`
- Enrollment data is stored in MongoDB collection: `training_enrollments`

## Sample Training Programs

The seed data (`backend/src/main/resources/training-data.json`) includes institute-specific details such as `instituteTrainingFees` and `totalStudentsAllowed` for each program. Current samples cover:
1. BMS Engineer Trainee
2. Data Analyst Intern
3. Full Stack Developer Trainee
4. Finance Executive Trainee
5. Medical Coding Trainee
6. Digital Marketing Trainee

