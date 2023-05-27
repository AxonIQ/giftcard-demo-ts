import { Test, TestingModule } from '@nestjs/testing';
import { GiftCardController } from './gift-card.controller';
import { Decider, View } from '@fraktalio/fmodel-ts';
import { GiftCardEvent } from '../api/gift-card.events';
import {
  giftCardEventHandler,
  GiftCardSummary,
} from '../query/gift-card.event-handler';
import { GiftCardMaterializedView } from '../query/gift-card.event-handler.materialized-view';
import { GiftCardAggregate } from '../command/gift-card.command-handler.aggregate';
import { GiftCardCommand } from '../api/gift-card.commands';
import {
  GiftCard,
  giftCardCommandHandler,
} from '../command/gift-card.command-handler';
import { GiftCardEventRepository } from '../command/gift-card.event-repository';
import { HttpModule } from '@nestjs/axios';
import {
  GiftCardSummaryEntity,
  GiftCardViewStateRepository,
} from '../query/gift-card.view-state-repository';
import { GiftCardCommandGateway } from '../command/gift-card.command-gateway';
import { ConfigModule } from '@nestjs/config';
import { AxonClient } from '../../axon.client';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GiftCardQueryGateway } from '../query/gift-card.query-gateway';

const giftCardArray = [
  {
    id: '1',
    initialAmount: 1000,
    remainingAmount: 800,
    isActive: true,
  },
  {
    id: '2',
    initialAmount: 1200,
    remainingAmount: 500,
    isActive: true,
  },
];

const oneGiftCard = {
  id: '1',
  initialAmount: 1000,
  remainingAmount: 800,
  isActive: true,
};
describe('GiftCardController', () => {
  let controller: GiftCardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        // TypeOrmModule.forRoot({
        //   type: 'postgres',
        //   host: 'localhost',
        //   port: 5432,
        //   username: 'postgres', // TODO: change to env
        //   password: 'postgres', // TODO: change to env
        //   database: 'axon', // TODO: change to env
        //   entities: [],
        //   synchronize: true, // TODO: change to false in production
        // }),
        // TypeOrmModule.forFeature([GiftCardSummaryEntity]),
      ],
      controllers: [GiftCardController],
      providers: [
        AxonClient,
        GiftCardAggregate,
        {
          provide: Decider<GiftCardCommand, GiftCard | null, GiftCardEvent>,
          useValue: giftCardCommandHandler,
        },
        GiftCardEventRepository,
        GiftCardCommandGateway,
        GiftCardMaterializedView,
        {
          provide: View<GiftCardSummary | null, GiftCardEvent>,
          useValue: giftCardEventHandler,
        },
        GiftCardViewStateRepository,
        {
          provide: getRepositoryToken(GiftCardSummaryEntity),
          useValue: {
            find: jest.fn().mockResolvedValue(giftCardArray),
            findOneBy: jest.fn().mockResolvedValue(oneGiftCard),
            save: jest.fn().mockResolvedValue(oneGiftCard),
            remove: jest.fn(),
            delete: jest.fn(),
          },
        },
        GiftCardQueryGateway,
      ],
    }).compile();

    controller = module.get<GiftCardController>(GiftCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
