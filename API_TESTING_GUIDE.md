# API Testing Guide

This guide provides step-by-step instructions for testing the Job Scheduler API with MongoDB and API versioning.

## Prerequisites

1. **Start MongoDB**:
   ```bash
   # Using Docker
   docker-compose up -d mongodb
   
   # Or using Homebrew (macOS)
   brew services start mongodb-community@7.0
   ```

2. **Start Redis**:
   ```bash
   # Using Docker
   docker-compose up -d redis
   
   # Or using Homebrew (macOS)
   brew services start redis
   ```

3. **Start the Application**:
   ```bash
   npm run start:dev
   ```

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Base URLs
- **Local**: `http://localhost:3000/api/v1`
- **Swagger Docs**: `http://localhost:3000/api/docs`

## Test Scenarios

### 1. User Registration

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

**Expected Response**:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "name": "Test User",
    "isActive": true,
    "createdAt": "2026-01-23T...",
    "updatedAt": "2026-01-23T..."
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Save the `access_token` from the response for subsequent requests.**

### 3. Create a One-Time Job

```bash
export TOKEN="YOUR_ACCESS_TOKEN_HERE"

curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Send Welcome Email",
    "description": "Send welcome email to new user",
    "type": "one_time",
    "scheduledAt": "2026-01-24T10:00:00Z",
    "payload": {
      "email": "user@example.com",
      "template": "welcome"
    },
    "maxRetries": 3
  }'
```

### 4. Create a Recurring Job

```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Daily Backup",
    "description": "Perform daily database backup",
    "type": "recurring",
    "recurrencePattern": "daily",
    "scheduledAt": "2026-01-24T02:00:00Z",
    "payload": {
      "backupType": "full"
    },
    "maxRetries": 5
  }'
```

### 5. Get All Jobs

```bash
# Get all jobs
curl -X GET "http://localhost:3000/api/v1/jobs" \
  -H "Authorization: Bearer $TOKEN"

# With filters
curl -X GET "http://localhost:3000/api/v1/jobs?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Filter by type
curl -X GET "http://localhost:3000/api/v1/jobs?type=recurring" \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Get Job by ID

```bash
export JOB_ID="507f1f77bcf86cd799439011"

curl -X GET "http://localhost:3000/api/v1/jobs/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Update a Job

```bash
curl -X PUT "http://localhost:3000/api/v1/jobs/$JOB_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Job Name",
    "scheduledAt": "2026-01-25T10:00:00Z"
  }'
```

### 8. Cancel a Job

```bash
curl -X POST "http://localhost:3000/api/v1/jobs/$JOB_ID/cancel" \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Reschedule a Job

```bash
curl -X POST "http://localhost:3000/api/v1/jobs/$JOB_ID/reschedule" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "scheduledAt": "2026-01-30T10:00:00Z"
  }'
```

### 10. Get Job Execution History

```bash
curl -X GET "http://localhost:3000/api/v1/jobs/$JOB_ID/executions" \
  -H "Authorization: Bearer $TOKEN"
```

### 11. Delete a Job

```bash
curl -X DELETE "http://localhost:3000/api/v1/jobs/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## MongoDB Verification

### Using mongosh

```bash
# Connect to MongoDB
mongosh

# Switch to database
use job_scheduler

# View all users
db.users.find().pretty()

# View all jobs
db.jobs.find().pretty()

# View jobs with specific status
db.jobs.find({ status: 'pending' }).pretty()

# View job executions
db.job_executions.find().pretty()

# Count documents
db.users.countDocuments()
db.jobs.countDocuments()

# View indexes
db.jobs.getIndexes()
```

### Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `job_scheduler`
4. Browse collections: `users`, `jobs`, `job_executions`

## Testing with Postman

1. Import the Postman collection: `postman-collection.json`
2. Update the base URL to: `http://localhost:3000/api/v1`
3. Set up environment variables:
   - `baseUrl`: `http://localhost:3000/api/v1`
   - `token`: (will be set after login)

## Automated Testing

### Run Unit Tests

```bash
npm run test
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Run Tests with Coverage

```bash
npm run test:cov
```

## Common Test Scenarios

### Scenario 1: Job Lifecycle
1. Register a user
2. Login and get token
3. Create a job
4. Get the job details
5. Update the job
6. Check execution history
7. Cancel the job
8. Delete the job

### Scenario 2: Recurring Jobs
1. Create a recurring job
2. Wait for execution
3. Check execution history (should have multiple entries)
4. Verify next run time is updated

### Scenario 3: Job Failure and Retry
1. Create a job that will fail
2. Monitor execution history
3. Verify retry attempts
4. Check final status after max retries

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log

# Restart MongoDB
brew services restart mongodb-community@7.0
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping

# Restart Redis
brew services restart redis
```

### Application Issues

```bash
# Check application logs
npm run start:dev

# Clear dist folder and rebuild
rm -rf dist
npm run build
```

## Performance Testing

### Using Apache Bench

```bash
# Test registration endpoint
ab -n 100 -c 10 -p register.json -T application/json \
  http://localhost:3000/api/v1/auth/register

# Test job creation (with auth header)
ab -n 100 -c 10 -p job.json -T application/json \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/jobs
```

### Using Artillery

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 100 http://localhost:3000/api/v1/jobs
```

## API Versioning Testing

### Test Version 1 (Current)

```bash
curl -X GET "http://localhost:3000/api/v1/jobs" \
  -H "Authorization: Bearer $TOKEN"
```

### Test Default Version

```bash
# This should also work (defaults to v1)
curl -X GET "http://localhost:3000/api/jobs" \
  -H "Authorization: Bearer $TOKEN"
```

### Future: Test Version 2

When v2 is implemented:

```bash
curl -X GET "http://localhost:3000/api/v2/jobs" \
  -H "Authorization: Bearer $TOKEN"
```

## Expected Results

### Successful Job Creation
- Status Code: 201
- Response includes job ID, status (pending), and all job details

### Successful Job Retrieval
- Status Code: 200
- Response includes job details with populated user information

### Successful Job Update
- Status Code: 200
- Response includes updated job details

### Successful Job Cancellation
- Status Code: 200
- Job status changes to 'cancelled'
- Job is no longer active

### Successful Job Deletion
- Status Code: 204
- Job is removed from database

## Notes

- All timestamps are in ISO 8601 format
- MongoDB ObjectIds are 24-character hexadecimal strings
- JWT tokens expire after 24 hours (configurable)
- Failed jobs are automatically retried based on maxRetries setting
- Recurring jobs automatically reschedule after completion
