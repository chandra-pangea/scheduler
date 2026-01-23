import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: jest.Mocked<Repository<User>>;
    let jwtService: jest.Mocked<JwtService>;

    const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        isActive: true,
        jobs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const mockUserRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        const mockJwtService = {
            sign: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepository = module.get(getRepositoryToken(User));
        jwtService = module.get(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const registerDto = {
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User',
            };

            userRepository.findOne.mockResolvedValue(null);
            userRepository.create.mockReturnValue(mockUser as any);
            userRepository.save.mockResolvedValue(mockUser);
            jwtService.sign.mockReturnValue('jwt-token');
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

            const result = await service.register(registerDto);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('access_token');
            expect(result.access_token).toBe('jwt-token');
            expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
        });

        it('should throw UnauthorizedException if email already exists', async () => {
            const registerDto = {
                email: 'existing@example.com',
                password: 'password123',
                name: 'Existing User',
            };

            userRepository.findOne.mockResolvedValue(mockUser);

            await expect(service.register(registerDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('login', () => {
        it('should login user successfully with valid credentials', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            userRepository.findOne.mockResolvedValue(mockUser);
            jwtService.sign.mockReturnValue('jwt-token');
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.login(loginDto);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('access_token');
            expect(result.access_token).toBe('jwt-token');
            expect(bcrypt.compare).toHaveBeenCalledWith(
                loginDto.password,
                mockUser.password,
            );
        });

        it('should throw UnauthorizedException if user not found', async () => {
            const loginDto = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };

            userRepository.findOne.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException if password is invalid', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            userRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('validateUser', () => {
        it('should validate and return user', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.validateUser('user-123');

            expect(result).toEqual(mockUser);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'user-123' },
            });
        });
    });
});
