import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.userModel.findOne({
            email: registerDto.email,
        }).exec();

        if (existingUser) {
            throw new UnauthorizedException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = new this.userModel({
            email: registerDto.email,
            password: hashedPassword,
            name: registerDto.name,
        });

        await user.save();

        const userObject = user.toObject();
        const { password, ...result } = userObject;
        const token = this.generateToken(user);

        return {
            user: result,
            access_token: token,
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.userModel.findOne({
            email: loginDto.email,
        }).exec();

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const userObject = user.toObject();
        const { password, ...result } = userObject;
        const token = this.generateToken(user);

        return {
            user: result,
            access_token: token,
        };
    }

    async validateUser(userId: string): Promise<UserDocument | null> {
        return this.userModel.findById(userId).exec();
    }

    private generateToken(user: UserDocument): string {
        const payload = { email: user.email, sub: user._id.toString() };
        return this.jwtService.sign(payload);
    }
}

