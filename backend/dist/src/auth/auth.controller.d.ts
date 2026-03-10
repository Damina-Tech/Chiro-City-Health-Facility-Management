import { AuthService, LoginDto } from './auth.service';
declare class LoginBodyDto implements LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: LoginBodyDto): Promise<{
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
export {};
