import { Module } from '@nestjs/common';
import { GiftCardModule } from './gift-card/gift-card.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    GiftCardModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'config.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: configService.get<boolean>(
          'DATABASE_AUTOLOADENTITIES',
        ),
        synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE'),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
