import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {

    }

    async validateUser(username: string, password: string): Promise<any | null> {
        const user = await this.userService.findOne(username);
        console.log('ValidateUser Found:', user);

        if (!user) return null;

        const isValidPassword = await bcrypt.compare(password, user.password);
        return isValidPassword ? user : null;
    }


    async login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await this.validateUser(username, password);
        if (!user) {
            throw new UnauthorizedException('Invalid username or password');
        }

        const payload = { userId: user._id.toString(), username: user.username, fullName: user.fullName };
        return this.generateTokens(payload)
    }


    async register(createUserDto: CreateUserDto): Promise<User> {
        return this.userService.createUser(createUserDto)
    }

    async generateTokens(payload: { userId: string; username: string, fullName: string }): Promise<{ accessToken: string; refreshToken: string; userId: string; fullName: string }> {
        const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        return {
            accessToken,
            refreshToken,
            userId: payload.userId,
            fullName: payload.fullName,
        };
    }

    async refreshToken(refreshToken: string): Promise<string> {
        try {
            const decoded = this.jwtService.verify(refreshToken);
            return this.jwtService.sign({ userId: decoded.userId }, { expiresIn: '1h' });
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
