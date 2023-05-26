import { Module } from '@nestjs/common';
import { GiftCardModule } from './gift-card/gift-card.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    GiftCardModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // TODO: change to env
      password: 'postgres', // TODO: change to env
      database: 'postgres', // TODO: change to env
      autoLoadEntities: true,
      synchronize: true, // TODO: change to false in production
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

export const AXONIQ_COMMANDNAME = 'axoniq-commandname';
export const AXONIQ_PAYLOADTYPE = 'axoniq-payloadtype';
export const AXONIQ_ROUTINGKEY = 'axoniq-routingkey';
export const AXONIQ_MESSAGEID = 'axoniq-messageid';
export const AXONIQ_EVENTNAME = 'axoniq-eventname';
export const AXONIQ_AGGREGATEID = 'axoniq-aggregateid';
export const AXONIQ_AGGREGATETYPE = 'axoniq-aggregatetype';
export const AXONIQ_SEQUENCENUMBER = 'axoniq-sequencenumber';
