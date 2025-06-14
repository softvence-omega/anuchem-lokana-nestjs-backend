import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';


@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const dbUrl = configService.get('DATABASE_URL');
                return {
                    type: 'postgres',
                    url: dbUrl,
                    synchronize: true,
                    autoLoadEntities: true,
                };
            },
        }),
    ],
})
export class DatabaseModule { }
