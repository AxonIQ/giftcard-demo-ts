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
import { GiftCardViewStateRepository } from '../query/gift-card.view-state-repository';
import { GiftCardCommandGateway } from '../command/gift-card.command-gateway';
import { ConfigModule } from '@nestjs/config';
import { AxonClient } from '../../axon.client';

describe('GiftCardController', () => {
  let controller: GiftCardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
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
      ],
    }).compile();

    controller = module.get<GiftCardController>(GiftCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
