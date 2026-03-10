import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, LoginDto } from './auth.service';
import { IsEmail, IsString, MinLength } from 'class-validator';

class LoginBodyDto implements LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginBodyDto) {
    return this.authService.login(body);
  }
}
