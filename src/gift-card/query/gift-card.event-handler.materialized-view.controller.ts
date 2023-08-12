import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { GiftCardEvent } from '../api/gift-card.events';
import { GiftCardMaterializedView } from './gift-card.event-handler.materialized-view';
import { AXONIQ_EVENTNAME, AXONIQ_QUERYNAME } from '../../axon.client';
import { AxonClient } from '../../axon.client';
import { GiftCardCommand } from '../api/gift-card.commands';
import { GiftCardQuery } from '../api/gift-card.queries';
import { GiftCardViewStateRepository } from './gift-card.view-state-repository';

/**
 * *** ADAPTER LAYER ***
 * ___
 * An event controller
 * ___
 * Callback entry point for all Gift Card events that are published/posted by the Axon Server/Axon Synapse
 */
@Controller()
export class GiftCardEventHandlerController implements OnModuleInit {
  private readonly logger = new Logger(GiftCardEventHandlerController.name);
  constructor(
    private readonly giftCardAMaterializedView: GiftCardMaterializedView,
    private readonly giftCardViewStateRepository: GiftCardViewStateRepository,
    private readonly axonClient: AxonClient<
      GiftCardCommand,
      GiftCardEvent,
      GiftCardQuery
    >,
  ) {}

  /**
   * Register the gift card event handler and query handler for the `default` context - on module initialization - the operation is idempotent
   */
  async onModuleInit(): Promise<void> {
    await this.axonClient
      .registerQueryHandler(
        '08a08dc4-0057-45e8-9291-9a47ffb09e52',
        ['FindByIdQuery', 'FindAllQuery'],
        'giftcard-demo-1',
        'Giftcard',
        '/queries',
      )
      .then((response) => {
        this.logger.log(
          `registered query handlers with response ${JSON.stringify(response)}`,
        );
      });

    await this.axonClient
      .registerEventHandler(
        '9954567e-1742-4446-b649-8f949ebf5520',
        [
          'GiftCardIssuedEvent',
          'GiftCardRedeemedEvent',
          'GiftCardCancelledEvent',
        ],
        'giftcard-demo-1',
        'Giftcard',
        '/events',
      )
      .then((response) => {
        this.logger.log(
          `registered event handlers with response ${JSON.stringify(response)}`,
        );
      });
  }

  /**
   * Handle the event published by AxonServer / AxonSynapse - a callback endpoint
   * @param request
   * @param headers
   */
  @Post('events')
  async handleEvents(
    @Body() request: GiftCardEvent,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log(
      `received event ${headers[AXONIQ_EVENTNAME]} with body ${JSON.stringify(
        request,
      )} and headers ${JSON.stringify(headers)}`,
    );
    return await this.giftCardAMaterializedView.handle(request);
  }

  /**
   * Handle the query published by AxonServer / AxonSynapse - a callback endpoint
   * @param request
   * @param headers
   */
  @Post('queries')
  async handleQueries(
    @Body() request: GiftCardQuery,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log(
      `received query ${headers[AXONIQ_QUERYNAME]} with body ${JSON.stringify(
        request,
      )} and headers ${JSON.stringify(headers)}`,
    );
    switch (request.kind) {
      case 'FindAllQuery':
        return this.giftCardViewStateRepository.findAll();
      case 'FindByIdQuery':
        return this.giftCardViewStateRepository.findById(request.id);
      default:
        // Exhaustive matching of the query type
        const _: never = request;
        this.logger.log('Never just happened in query handler: ' + _);
        return [];
    }
  }
}
