# Testing Guide

This document explains the testing strategy and how to run tests for the Job Scheduler System.

## Testing Strategy

We follow a comprehensive testing approach:

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user workflows

## Test Coverage

Our tests cover:
- ✅ Services (Business Logic)
- ✅ Repositories (Data Access)
- ✅ Controllers (API Endpoints)
- ✅ Authentication & Authorization
- ✅ Job Execution & Retry Logic
- ✅ Error Handling

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Test Coverage Report
```bash
npm run test:cov
```

This generates a coverage report in the `coverage/` directory.

### E2E Tests
```bash
npm run test:e2e
```

### Specific Test File
```bash
npm test -- jobs.service.spec.ts
```

## Test Structure

### Unit Test Example

```typescript
describe('JobsService', () => {
  let service: JobsService;
  let mockRepository: jest.Mocked<JobRepository>;

  beforeEach(async () => {
    // Setup test module with mocked dependencies
    const module = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: JobRepository, useValue: mockRepository }
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should create a job', async () => {
    // Arrange
    const createJobDto = { name: 'Test Job', ... };
    
    // Act
    const result = await service.createJob('user-id', createJobDto);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe('Test Job');
  });
});
```

## Test Files

### Services Tests

#### `jobs.service.spec.ts`
Tests for job management service:
- ✅ Job creation
- ✅ Job retrieval (single & multiple)
- ✅ Job updates
- ✅ Job cancellation
- ✅ Job deletion
- ✅ Job rescheduling
- ✅ Job execution
- ✅ Retry logic
- ✅ Recurring job scheduling
- ✅ Execution history

**Coverage**: 32 test cases

#### `auth.service.spec.ts`
Tests for authentication service:
- ✅ User registration
- ✅ Duplicate email handling
- ✅ User login
- ✅ Invalid credentials handling
- ✅ User validation
- ✅ JWT token generation

**Coverage**: 7 test cases

### Repository Tests

#### `job.repository.spec.ts`
Tests for job repository:
- ✅ Create job
- ✅ Find job by ID
- ✅ Find all jobs with pagination
- ✅ Update job
- ✅ Delete job
- ✅ Find pending jobs
- ✅ Find recurring jobs
- ✅ Not found scenarios

**Coverage**: 8 test cases

## Mocking Strategy

### Database Mocking
```typescript
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
};
```

### Service Mocking
```typescript
const mockJobScheduler = {
  scheduleJob: jest.fn(),
  cancelJob: jest.fn(),
  rescheduleJob: jest.fn(),
};
```

### External Dependencies
```typescript
jest.mock('bcrypt');
(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
```

## Test Scenarios

### Success Scenarios
- ✅ Job created successfully
- ✅ Job executed successfully
- ✅ User authenticated successfully
- ✅ Job rescheduled successfully

### Error Scenarios
- ✅ Job not found (404)
- ✅ Invalid credentials (401)
- ✅ Job execution failure
- ✅ Max retries exceeded
- ✅ Cannot cancel completed job

### Edge Cases
- ✅ Retry logic with different retry counts
- ✅ Recurring job next run calculation
- ✅ Concurrent job execution
- ✅ Empty result sets

## Writing New Tests

### 1. Create Test File
```bash
# For a new service
touch src/module-name/service-name.spec.ts
```

### 2. Basic Test Template
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('methodName', () => {
    it('should do something', async () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = await service.methodName(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### 3. Testing Best Practices

#### Use AAA Pattern
```typescript
it('should create a job', async () => {
  // Arrange - Setup test data and mocks
  const createJobDto = { name: 'Test' };
  mockRepository.create.mockResolvedValue(mockJob);
  
  // Act - Execute the method
  const result = await service.createJob('user-id', createJobDto);
  
  // Assert - Verify the results
  expect(result).toEqual(mockJob);
  expect(mockRepository.create).toHaveBeenCalledWith('user-id', createJobDto);
});
```

#### Test One Thing Per Test
```typescript
// Good ✅
it('should create a job', async () => { ... });
it('should schedule the created job', async () => { ... });

// Bad ❌
it('should create and schedule a job', async () => { ... });
```

#### Use Descriptive Test Names
```typescript
// Good ✅
it('should throw NotFoundException when job not found', async () => { ... });

// Bad ❌
it('should throw error', async () => { ... });
```

## Test Coverage Goals

| Component | Target Coverage | Current Coverage |
|-----------|----------------|------------------|
| Services  | 90%            | 95%              |
| Repositories | 85%         | 90%              |
| Controllers | 80%          | TBD              |
| Overall   | 85%            | 90%+             |

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm test
      - run: npm run test:cov
```

## Debugging Tests

### Run Single Test
```bash
npm test -- -t "should create a job"
```

### Enable Verbose Output
```bash
npm test -- --verbose
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Common Testing Patterns

### Testing Async Operations
```typescript
it('should handle async operations', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});
```

### Testing Exceptions
```typescript
it('should throw NotFoundException', async () => {
  mockRepository.findOne.mockResolvedValue(null);
  
  await expect(
    service.getJob('non-existent', 'user-id')
  ).rejects.toThrow(NotFoundException);
});
```

### Testing with Timers
```typescript
it('should schedule job with delay', async () => {
  jest.useFakeTimers();
  
  await service.scheduleJob(job);
  jest.advanceTimersByTime(5000);
  
  expect(mockScheduler.scheduleJob).toHaveBeenCalled();
  
  jest.useRealTimers();
});
```

## Test Data Management

### Mock Data Factory
```typescript
// test/factories/job.factory.ts
export const createMockJob = (overrides?: Partial<Job>): Job => ({
  id: 'test-id',
  name: 'Test Job',
  type: JobType.ONE_TIME,
  status: JobStatus.PENDING,
  ...overrides,
});
```

### Usage
```typescript
const mockJob = createMockJob({ name: 'Custom Name' });
```

## Performance Testing

### Measure Test Execution Time
```bash
npm test -- --verbose --detectOpenHandles
```

### Identify Slow Tests
```bash
npm test -- --verbose | grep -E "PASS|FAIL" | sort -k2 -n
```

## Test Maintenance

### Regular Tasks
1. **Update tests** when changing business logic
2. **Remove obsolete tests** for removed features
3. **Refactor tests** to reduce duplication
4. **Review coverage** reports monthly
5. **Update mocks** when dependencies change

### Code Review Checklist
- [ ] All new code has tests
- [ ] Tests follow naming conventions
- [ ] Tests are independent
- [ ] Mocks are properly configured
- [ ] Edge cases are covered
- [ ] Error scenarios are tested

## Resources

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)

## Troubleshooting

### Tests Hanging
```bash
# Add timeout
npm test -- --testTimeout=10000
```

### Memory Issues
```bash
# Run tests in band (sequentially)
npm test -- --runInBand
```

### Module Resolution Errors
```bash
# Clear Jest cache
npm test -- --clearCache
```

---

**Remember**: Good tests are:
- ✅ Fast
- ✅ Independent
- ✅ Repeatable
- ✅ Self-validating
- ✅ Timely

Happy Testing! 🧪
