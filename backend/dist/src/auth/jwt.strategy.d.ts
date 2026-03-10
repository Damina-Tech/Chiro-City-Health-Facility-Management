import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../common/decorators/current-user.decorator';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private config;
    constructor(config: ConfigService);
    validate(payload: any): Promise<JwtPayload>;
}
export {};
