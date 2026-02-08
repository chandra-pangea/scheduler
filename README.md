# Job Scheduler System

A robust, scalable distributed job scheduling system built with NestJS, MongoDB, and Redis, following SOLID principles and clean architecture patterns.

## 🚀 Quick Links

- **[📖 Swagger API Docs](http://localhost:3000/api/docs)** - Interactive API documentation with payload examples (Start here!)
- **[🎯 Quick Start Guide](./QUICK_START.md)** - Get started in 5 minutes
- **[💡 Understanding Payloads](./PAYLOAD_EXPLANATION.md)** - Learn how to use job payloads effectively
- **[🧪 API Testing Guide](./API_TESTING_GUIDE.md)** - Complete API examples

## ✨ Latest Updates

- **MongoDB Integration**: Migrated from PostgreSQL to MongoDB with Mongoose
- **API Versioning**: Implemented URI-based versioning (v1)
- **Enhanced Performance**: Optimized queries with MongoDB indexes
- **Improved Scalability**: Better horizontal scaling with MongoDB
- **Backend API Only**: Pure REST API system for maximum flexibility

## 🎯 Features

- **Job Submission**: Submit one-time or recurring jobs with flexible scheduling
- **Recurring Jobs**: Support for hourly, daily, weekly, and monthly recurring tasks
- **Job Management**: Complete CRUD operations for job lifecycle management
- **Failure Handling**: Automatic retry mechanism with exponential backoff
- **Logging & Monitoring**: Comprehensive execution history and job status tracking
- **Authentication**: JWT-based authentication and authorization
- **RESTful API**: Well-documented REST endpoints with Swagger/OpenAPI
- **Scalability**: Built on Bull queue system with Redis for distributed processing

## 🏗️ Architecture & Design Principles

### SOLID Principles Implementation

1. **Single Responsibility Principle (SRP)**
   - Each service has a single, well-defined responsibility
   - `JobsService`: Orchestrates job operations
   - `JobExecutor`: Handles job execution logic
   - `JobScheduler`: Manages job scheduling
   - `JobLogger`: Handles execution logging

2. **Open/Closed Principle (OCP)**
   - `DefaultJobExecutor` can be extended for custom job types without modification
   - Interface-based design allows for easy extension

3. **Liskov Substitution Principle (LSP)**
   - All implementations adhere to their interface contracts
   - Repository pattern ensures interchangeable implementations

4. **Interface Segregation Principle (ISP)**
   - Small, focused interfaces: `IJobExecutor`, `IJobScheduler`, `IJobLogger`, `IJobRepository`
   - Clients depend only on interfaces they use

5. **Dependency Inversion Principle (DIP)**
   - High-level modules depend on abstractions (interfaces)
   - Dependency injection throughout the application

### Clean Architecture

```
src/
├── auth/                    # Authentication module
│   ├── dto/                # Data transfer objects
│   ├── guards/             # Auth guards
│   ├── strategies/         # Passport strategies
│   └── auth.service.ts     # Auth business logic
├── users/                   # User management
│   └── entities/           # User entity
├── jobs/                    # Job scheduling module
│   ├── controllers/        # HTTP controllers
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer
│   ├── processors/         # Queue processors
│   ├── entities/           # Domain entities
│   ├── dto/                # Data transfer objects
│   └── interfaces/         # Contracts/Interfaces
└── main.ts                 # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v7 or higher)
- Redis (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd scheduler
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/job_scheduler

# Or use individual parameters
DB_HOST=localhost
DB_PORT=27017
DB_DATABASE=job_scheduler

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h

PORT=3000
NODE_ENV=development

MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=5000
```

4. **Set up MongoDB**
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7-jammy

# Verify MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

5. **Start Redis**
```bash
# macOS (using Homebrew)
brew services start redis

# Or using Docker
docker run -d -p 6379:6379 redis:latest
```

6. **Run the application**
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will be available at:
- **API Base URL**: http://localhost:3000/api/v1
- **Swagger Documentation**: http://localhost:3000/api/docs

## 📚 API Documentation

### API Versioning

All API endpoints are versioned and prefixed with `/api/v1`:

**Base URL**: `http://localhost:3000/api/v1`

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "isActive": true,
    "createdAt": "2026-01-23T...",
    "updatedAt": "2026-01-23T..."
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Job Management Endpoints

All job endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

#### Create Job
```http
POST /api/v1/jobs
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Send Weekly Report",
  "description": "Generate and send weekly analytics report",
  "type": "one_time",
  "payload": {
    "reportType": "analytics",
    "recipients": ["admin@example.com"]
  },
  "scheduledAt": "2026-01-25T10:00:00Z",
  "maxRetries": 3
}
```

**Recurring Job Example:**
```json
{
  "name": "Daily Backup",
  "description": "Perform daily database backup",
  "type": "recurring",
  "recurrencePattern": "daily",
  "scheduledAt": "2026-01-24T02:00:00Z",
  "maxRetries": 5
}
```

#### Get All Jobs
```http
GET /api/v1/jobs?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by job status (pending, running, completed, failed, cancelled)
- `type`: Filter by job type (one_time, recurring)
- `fromDate`: Filter jobs created after this date
- `toDate`: Filter jobs created before this date
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### Get Job by ID
```http
GET /api/v1/jobs/:id
Authorization: Bearer <token>
```

#### Update Job
```http
PUT /api/v1/jobs/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Job Name",
  "scheduledAt": "2026-01-25T10:00:00Z"
}
```

#### Cancel Job
```http
POST /api/v1/jobs/:id/cancel
Authorization: Bearer <token>
```

#### Reschedule Job
```http
POST /api/v1/jobs/:id/reschedule
Content-Type: application/json
Authorization: Bearer <token>

{
  "scheduledAt": "2026-01-30T10:00:00Z"
}
```

#### Delete Job
```http
DELETE /api/v1/jobs/:id
Authorization: Bearer <token>
```

#### Get Job Execution History
```http
GET /api/v1/jobs/:id/executions
Authorization: Bearer <token>
```

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run E2E Tests
```bash
npm run test:e2e
```

## 🔧 Configuration

### Job Types

1. **One-Time Jobs**: Execute once at the specified time
2. **Recurring Jobs**: Execute repeatedly based on recurrence pattern

### Recurrence Patterns

- `hourly`: Every hour
- `daily`: Every day
- `weekly`: Every week
- `monthly`: Every month

### Retry Configuration

Jobs automatically retry on failure with exponential backoff:
- Default max retries: 3
- Backoff delay: 5000ms (exponential)
- Configurable per job via `maxRetries` field

## 📊 Database Schema

### MongoDB Collections

#### Users Collection
- `_id`: ObjectId (Primary Key)
- `email`: String (Unique, Indexed)
- `password`: String (Hashed with bcrypt)
- `name`: String
- `isActive`: Boolean (default: true)
- `createdAt`: Timestamp (auto-generated)
- `updatedAt`: Timestamp (auto-generated)

#### Jobs Collection
- `_id`: ObjectId (Primary Key)
- `name`: String (required)
- `description`: String
- `type`: Enum (one_time, recurring)
- `status`: Enum (pending, running, completed, failed, cancelled)
- `payload`: Object (BSON)
- `scheduledAt`: Date
- `startedAt`: Date (optional)
- `completedAt`: Date (optional)
- `recurrencePattern`: Enum (hourly, daily, weekly, monthly) - optional
- `retryCount`: Number (default: 0)
- `maxRetries`: Number (default: 3)
- `errorMessage`: String (optional)
- `result`: Object (BSON) - optional
- `userId`: ObjectId (Foreign Key, ref: 'User')
- `nextRunAt`: Date
- `isActive`: Boolean (default: true)
- `createdAt`: Timestamp (auto-generated)
- `updatedAt`: Timestamp (auto-generated)

**Indexes:**
- `{ userId: 1, status: 1 }` - Compound index for user job queries
- `{ scheduledAt: 1 }` - Index for scheduling queries
- `{ nextRunAt: 1 }` - Index for recurring job processing

#### Job Executions Collection
- `_id`: ObjectId (Primary Key)
- `jobId`: ObjectId (Foreign Key, ref: 'Job')
- `status`: Enum (success, failed)
- `startedAt`: Date (required)
- `completedAt`: Date
- `errorMessage`: String
- `result`: Object (BSON)
- `attemptNumber`: Number (default: 0)
- `createdAt`: Timestamp (auto-generated)
- `updatedAt`: Timestamp (auto-generated)

**Indexes:**
- `{ jobId: 1, createdAt: -1 }` - Compound index for execution history queries

## 🎨 Design Decisions

### Why MongoDB?
- **Flexibility**: Schema-less design allows for easy evolution
- **Performance**: Fast reads and writes with proper indexing
- **Scalability**: Horizontal scaling with sharding support
- **JSON-native**: Perfect for storing job payloads and results
- **Aggregation**: Powerful aggregation pipeline for analytics

### Why Mongoose?
- **Type Safety**: Full TypeScript support with schemas
- **Validation**: Built-in schema validation
- **Middleware**: Pre/post hooks for business logic
- **Population**: Easy relationship management
- **Active Community**: Well-maintained and documented

### Why Bull Queue?
- **Reliability**: Persistent job storage in Redis
- **Scalability**: Distributed processing across multiple workers
- **Features**: Built-in retry logic, delayed jobs, priority queues
- **Monitoring**: Job status tracking and metrics

### Why JWT Authentication?
- **Stateless**: No server-side session storage
- **Scalable**: Works well in distributed systems
- **Standard**: Industry-standard authentication method

### API Versioning Strategy
- **URI Versioning**: Clear and explicit version in URL
- **Backward Compatibility**: Maintain old versions while introducing new features
- **Future-Proof**: Easy to add v2, v3, etc.

### Separation of Concerns
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and orchestration
- **Repositories**: Data access layer
- **Schemas**: Domain models with validation
- **DTOs**: Data validation and transformation

## 🔒 Security

- Passwords hashed using bcrypt (10 rounds)
- JWT tokens for stateless authentication
- Input validation using class-validator
- MongoDB injection prevention via Mongoose parameterized queries
- CORS enabled for cross-origin requests
- Environment variables for sensitive configuration

## 📈 Scalability Considerations

1. **Horizontal Scaling**: 
   - Multiple application instances can share the same Redis queue
   - MongoDB supports sharding for horizontal data distribution
2. **Database Connection Pooling**: Mongoose manages connection pools efficiently
3. **Queue Workers**: Separate worker processes can be deployed for job processing
4. **Caching**: Redis can be extended for caching frequently accessed data
5. **Load Balancing**: Application instances can be load-balanced
6. **MongoDB Replica Sets**: High availability with automatic failover
7. **Indexing Strategy**: Optimized indexes for common query patterns

## 🐛 Error Handling

- **Validation Errors**: Automatic DTO validation with detailed error messages
- **Not Found Errors**: Proper 404 responses for missing resources
- **Authentication Errors**: 401 Unauthorized for invalid credentials
- **Job Execution Errors**: Logged with retry mechanism
- **Database Errors**: Graceful error handling with meaningful messages

## 📝 Logging

- **Application Logs**: NestJS built-in logger
- **Job Execution Logs**: Stored in `job_executions` collection
- **Error Logs**: Detailed error messages and stack traces
- **Audit Trail**: Complete history of job executions
- **MongoDB Logs**: Query profiling and slow query detection

## 🚦 Health Checks

Monitor system health by checking:
- **MongoDB Connectivity**: `mongosh --eval "db.adminCommand('ping')"`
- **Redis Connectivity**: `redis-cli ping`
- **Queue Status**: Monitor Bull queue metrics
- **Application Uptime**: Check process status
- **Database Indexes**: Verify index usage with `db.jobs.getIndexes()`

## 🔄 Future Enhancements

- [ ] Job priorities and multiple queues
- [ ] Webhook notifications for job events
- [ ] Job dependencies and workflows
- [ ] Real-time job monitoring dashboard
- [ ] Job templates and presets
- [ ] Advanced scheduling (cron expressions)
- [ ] Job result storage and retrieval
- [ ] Multi-tenancy support
- [ ] Rate limiting
- [ ] Metrics and analytics
- [ ] MongoDB Atlas integration for cloud deployment
- [ ] Database migrations with migrate-mongo
- [ ] GraphQL API (v2)
- [ ] WebSocket support for real-time updates

## 📄 License

This project is licensed under the MIT License.

## 📚 Additional Documentation

- **[MongoDB Migration Guide](./MONGODB_MIGRATION.md)**: Complete guide for MongoDB setup and migration
- **[API Testing Guide](./API_TESTING_GUIDE.md)**: Comprehensive testing instructions with examples
- **[Architecture Documentation](./ARCHITECTURE.md)**: Detailed system architecture
- **[Testing Guide](./TESTING.md)**: Unit and E2E testing documentation

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact: [your-email@example.com]

## 🙏 Acknowledgments

- NestJS framework and community
- MongoDB and Mongoose teams
- Bull queue library
- Redis community
- All contributors

---

Built with ❤️ using NestJS, MongoDB, and TypeScript

