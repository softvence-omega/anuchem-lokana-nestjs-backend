import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BcryptService {
    private readonly saltRounds: number;

    constructor(private readonly configService: ConfigService) {
        this.saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUND') || 10);
    }

    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    async comparePasswords(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}
