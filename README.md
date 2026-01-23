# Job Scheduler System

A robust, scalable distributed job scheduling system built with NestJS, following SOLID principles and clean architecture patterns.

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
- PostgreSQL (v14 or higher)
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
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
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

4. **Set up PostgreSQL database**
```bash
# Create database
createdb job_scheduler

# Or using psql
psql -U postgres
CREATE DATABASE job_scheduler;
\q
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
- API: http://localhost:3000
- Swagger Documentation: http://localhost:3000/api

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
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
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "isActive": true,
    "createdAt": "2026-01-15T...",
    "updatedAt": "2026-01-15T..."
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /auth/login
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
POST /jobs
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
  "scheduledAt": "2026-01-20T10:00:00Z",
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
  "scheduledAt": "2026-01-16T02:00:00Z",
  "maxRetries": 5
}
```

#### Get All Jobs
```http
GET /jobs?status=pending&page=1&limit=10
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
GET /jobs/:id
Authorization: Bearer <token>
```

#### Update Job
```http
PUT /jobs/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Job Name",
  "scheduledAt": "2026-01-25T10:00:00Z"
}
```

#### Cancel Job
```http
POST /jobs/:id/cancel
Authorization: Bearer <token>
```

#### Reschedule Job
```http
POST /jobs/:id/reschedule
Content-Type: application/json
Authorization: Bearer <token>

{
  "scheduledAt": "2026-01-30T10:00:00Z"
}
```

#### Delete Job
```http
DELETE /jobs/:id
Authorization: Bearer <token>
```

#### Get Job Execution History
```http
GET /jobs/:id/executions
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

### Users Table
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `password`: String (Hashed)
- `name`: String
- `isActive`: Boolean
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Jobs Table
- `id`: UUID (Primary Key)
- `name`: String
- `description`: Text
- `type`: Enum (one_time, recurring)
- `status`: Enum (pending, running, completed, failed, cancelled)
- `payload`: JSONB
- `scheduledAt`: Timestamp
- `startedAt`: Timestamp
- `completedAt`: Timestamp
- `recurrencePattern`: Enum (hourly, daily, weekly, monthly)
- `retryCount`: Integer
- `maxRetries`: Integer
- `errorMessage`: Text
- `result`: JSONB
- `userId`: UUID (Foreign Key)
- `nextRunAt`: Timestamp
- `isActive`: Boolean
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Job Executions Table
- `id`: UUID (Primary Key)
- `jobId`: UUID (Foreign Key)
- `status`: Enum (success, failed)
- `startedAt`: Timestamp
- `completedAt`: Timestamp
- `errorMessage`: Text
- `result`: JSONB
- `attemptNumber`: Integer
- `createdAt`: Timestamp

## 🎨 Design Decisions

### Why Bull Queue?
- **Reliability**: Persistent job storage in Redis
- **Scalability**: Distributed processing across multiple workers
- **Features**: Built-in retry logic, delayed jobs, priority queues
- **Monitoring**: Job status tracking and metrics

### Why TypeORM?
- **Type Safety**: Full TypeScript support
- **Migrations**: Database schema version control
- **Relations**: Easy entity relationship management
- **Active Record & Data Mapper**: Flexible patterns

### Why JWT Authentication?
- **Stateless**: No server-side session storage
- **Scalable**: Works well in distributed systems
- **Standard**: Industry-standard authentication method

### Separation of Concerns
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and orchestration
- **Repositories**: Data access layer
- **Entities**: Domain models
- **DTOs**: Data validation and transformation

## 🔒 Security

- Passwords hashed using bcrypt (10 rounds)
- JWT tokens for stateless authentication
- Input validation using class-validator
- SQL injection prevention via TypeORM parameterized queries
- CORS enabled for cross-origin requests

## 📈 Scalability Considerations

1. **Horizontal Scaling**: Multiple application instances can share the same Redis queue
2. **Database Connection Pooling**: TypeORM manages connection pools efficiently
3. **Queue Workers**: Separate worker processes can be deployed for job processing
4. **Caching**: Redis can be extended for caching frequently accessed data
5. **Load Balancing**: Application instances can be load-balanced

## 🐛 Error Handling

- **Validation Errors**: Automatic DTO validation with detailed error messages
- **Not Found Errors**: Proper 404 responses for missing resources
- **Authentication Errors**: 401 Unauthorized for invalid credentials
- **Job Execution Errors**: Logged with retry mechanism
- **Database Errors**: Graceful error handling with meaningful messages

## 📝 Logging

- **Application Logs**: NestJS built-in logger
- **Job Execution Logs**: Stored in `job_executions` table
- **Error Logs**: Detailed error messages and stack traces
- **Audit Trail**: Complete history of job executions

## 🚦 Health Checks

Monitor system health by checking:
- Database connectivity
- Redis connectivity
- Queue status
- Application uptime

## 🔄 Future Enhancements

- [ ] Job priorities and queues
- [ ] Webhook notifications for job events
- [ ] Job dependencies and workflows
- [ ] Real-time job monitoring dashboard
- [ ] Job templates and presets
- [ ] Advanced scheduling (cron expressions)
- [ ] Job result storage and retrieval
- [ ] Multi-tenancy support
- [ ] Rate limiting
- [ ] Metrics and analytics

## 📄 License

This project is licensed under the MIT License.

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
- Bull queue library
- TypeORM team
- All contributors

---

Built with ❤️ using NestJS and TypeScript
# scheduler
