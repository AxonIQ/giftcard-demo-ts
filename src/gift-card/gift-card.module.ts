import { Module } from '@nestjs/common';
import { GiftCardController } from './web/gift-card.controller';
import { Decider, View } from '@fraktalio/fmodel-ts';
import { GiftCardCommand } from './api/gift-card.commands';
import { GiftCardEvent } from './api/gift-card.events';
import {
  GiftCard,
  giftCardCommandHandler,
} from './command/gift-card.command-handler';
import {
  giftCardEventHandler,
  GiftCardSummary,
} from './query/gift-card.event-handler';
import { GiftCardMaterializedView } from './query/gift-card.event-handler.materialized-view';
import { GiftCardCommandHandlerController } from './command/gift-card.command-handler.aggregate.controller';
import { GiftCardEventHandlerController } from './query/gift-card.event-handler.materialized-view.controller';
import { HttpModule } from '@nestjs/axios';
import { GiftCardAggregate } from './command/gift-card.command-handler.aggregate';
import { GiftCardEventRepository } from './command/gift-card.event-repository';
import {
  GiftCardSummaryEntity,
  GiftCardViewStateRepository,
} from './query/gift-card.view-state-repository';
import { GiftCardCommandGateway } from './command/gift-card.command-gateway';
import { AxonClient } from '../axon.client';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftCardQueryGateway } from './query/gift-card.query-gateway';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    TypeOrmModule.forFeature([GiftCardSummaryEntity]),
  ],
  controllers: [
    GiftCardController,
    GiftCardCommandHandlerController,
    GiftCardEventHandlerController,
  ],
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
    GiftCardQueryGateway,
  ],
})
export class GiftCardModule {}
