# Job Scheduler - Quick Start Guide

## What is This Scheduler?

This is a **backend API system** that allows you to schedule and execute tasks at specific times. Think of it as a powerful cron job system with a REST API.

### Real-World Use Cases

1. **Send Scheduled Emails** - Welcome emails, newsletters, reminders
2. **Database Backups** - Automatic daily/weekly backups
3. **Report Generation** - Monthly sales reports, analytics
4. **Data Cleanup** - Remove old logs, archive data
5. **API Integrations** - Sync data with external services
6. **Notifications** - Send alerts at specific times
7. **Data Processing** - Batch processing of files or records

## Key Concepts

### 1. **Job**
A task that needs to be executed at a specific time.

### 2. **Job Types**
- **one_time**: Runs once at the scheduled time
- **recurring**: Runs repeatedly (hourly, daily, weekly, monthly)

### 3. **Payload** (Most Important!)
A flexible JSON object containing the data your job needs to execute.

**Example**: For an email job, the payload might contain:
```json
{
  "recipient": "user@example.com",
  "subject": "Welcome!",
  "template": "welcome-email"
}
```

### 4. **Job Executor**
The code that actually performs the task using the payload data.

## How It Works

```
1. You create a job via API
   ↓
2. Job is stored in MongoDB
   ↓
3. Scheduler monitors for jobs ready to run
   ↓
4. Job is added to Redis queue at scheduled time
   ↓
5. Job Executor reads the payload and performs the task
   ↓
6. Results are stored in the database
```

## Quick Start

### 1. Start the Services
```bash
# Start MongoDB
brew services start mongodb-community

# Start Redis
brew services start redis

# Start the application
npm run start:dev
```

### 2. Register a User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

**Save the `access_token` from the response!**

### 3. Create Your First Job
```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Job",
    "type": "one_time",
    "scheduledAt": "2026-02-09T10:00:00Z",
    "payload": {
      "message": "Hello World!",
      "action": "test"
    }
  }'
```

### 4. View Your Jobs
```bash
curl -X GET http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Understanding Payload with Examples

### Example 1: Email Notification
```json
{
  "name": "Send Welcome Email",
  "type": "one_time",
  "scheduledAt": "2026-02-09T10:00:00Z",
  "payload": {
    "emailType": "welcome",
    "recipient": "newuser@example.com",
    "userName": "John Doe",
    "templateId": "welcome-v2"
  }
}
```

### Example 2: Daily Database Backup
```json
{
  "name": "Daily Backup",
  "type": "recurring",
  "recurrencePattern": "daily",
  "scheduledAt": "2026-02-09T02:00:00Z",
  "payload": {
    "database": "production_db",
    "backupLocation": "s3://backups/daily/",
    "compression": "gzip",
    "retentionDays": 30
  }
}
```

### Example 3: Monthly Report
```json
{
  "name": "Monthly Sales Report",
  "type": "recurring",
  "recurrencePattern": "monthly",
  "payload": {
    "reportType": "sales",
    "recipients": ["manager@example.com", "ceo@example.com"],
    "format": "pdf",
    "includeCharts": true,
    "dateRange": "last_month"
  }
}
```

## Exploring the API

### Option 1: Swagger UI (Recommended!)
Open your browser and go to:
```
http://localhost:3000/api/docs
```

Here you can:
- See all available endpoints
- Read detailed documentation with examples
- Try out the API directly in your browser
- See payload examples for different use cases

### Option 2: Postman
Import the collection from `postman-collection.json`

### Option 3: cURL
See `API_TESTING_GUIDE.md` for complete examples

## What Happens When a Job Runs?

Currently, the system uses a **simulation executor** that:
1. Reads the job and its payload
2. Simulates work (waits for a duration)
3. Returns a success result

**To make it do real work**, you need to:
1. Create a custom executor (extend `DefaultJobExecutor`)
2. Read the payload to determine what to do
3. Perform the actual task (send email, backup database, etc.)
4. Return the result

See `PAYLOAD_EXPLANATION.md` for detailed examples of how to extend the executor.

## Important Files

- **PAYLOAD_EXPLANATION.md** - Comprehensive guide to understanding and using payloads
- **README.md** - Full documentation
- **API_TESTING_GUIDE.md** - API testing examples
- **TESTING.md** - Unit and E2E testing guide

## Next Steps

1. ✅ Explore the Swagger documentation at http://localhost:3000/api/docs
2. ✅ Read PAYLOAD_EXPLANATION.md to understand payloads deeply
3. ✅ Create test jobs with different payloads
4. ✅ Extend the DefaultJobExecutor to perform real tasks
5. ✅ Build your custom job types

## Common Questions

**Q: What can I put in the payload?**
A: Any valid JSON data - strings, numbers, arrays, nested objects, etc.

**Q: How do I make the job actually do something?**
A: Extend the `DefaultJobExecutor` class and implement your custom logic that reads the payload.

**Q: Can I schedule a job to run every hour?**
A: Yes! Set `type: "recurring"` and `recurrencePattern: "hourly"`

**Q: How do I see if a job succeeded or failed?**
A: Use the `/api/v1/jobs/:id/executions` endpoint to see execution history.

**Q: Can I cancel a scheduled job?**
A: Yes! Use the `/api/v1/jobs/:id/cancel` endpoint.

## Support

- Check Swagger docs: http://localhost:3000/api/docs
- Read PAYLOAD_EXPLANATION.md for payload details
- See API_TESTING_GUIDE.md for API examples
