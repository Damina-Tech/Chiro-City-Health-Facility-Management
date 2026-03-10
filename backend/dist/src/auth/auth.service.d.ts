import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
}
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<AuthUser | null>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            permissions: string[];
        };
    }>;
}
