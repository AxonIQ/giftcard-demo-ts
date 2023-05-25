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
import { AXONIQ_EVENTNAME } from '../../app.module';
import { AxonClient } from '../../axon.client';
import { GiftCardCommand } from '../api/gift-card.commands';

/**
 * *** ADAPTER LAYER ***
 * ___
 * An event controller
 * ___
 * Callback entry point for all Gift Card events that are published/posted by the Axon Server/Axon Synapse
 */
@Controller('events')
export class GiftCardEventHandlerController implements OnModuleInit {
  private readonly logger = new Logger(GiftCardEventHandlerController.name);
  constructor(
    private readonly giftCardAMaterializedView: GiftCardMaterializedView,
    private readonly axonClient: AxonClient<GiftCardCommand, GiftCardEvent>,
  ) {}

  /**
   * Register the gift card event handler for the `default` context - on module initialization
   */
  async onModuleInit(): Promise<void> {
    this.logger.log(
      '### registering event handlers via PUT is not possible at the moment due to a known bug in Axon Synapse ###',
    );
    this.logger.log('### Do it manually ###');
    this.logger.log(
      'POST http://localhost:8080/v1/contexts/default/handlers/events\\r\\nContent-Type: application/json\\r\\n\\r\\n{\\r\\n  \\"names\\": [\\r\\n    \\"GiftCardIssuedEvent\\", \\"GiftCardRedeemedEvent\\", \\"GiftCardCanceledEvent\\"\\r\\n  ],\\r\\n  \\"endpoint\\": \\"http://localhost:3000/events\\",\\r\\n  \\"endpointType\\": \\"http-raw\\",\\r\\n  \\"clientId\\": \\"giftcard-demo-1\\",\\r\\n  \\"componentName\\": \\"Giftcard\\"\\r\\n}',
    );
    // return this.axonClient
    //   .registerEventHandler(
    //     '9954567e-1742-4446-b649-8f949ebf5520',
    //     [
    //       'GiftCardIssuedEvent',
    //       'GiftCardRedeemedEvent',
    //       'GiftCardCanceledEvent',
    //     ],
    //     'giftcard-demo-1',
    //     'Giftcard',
    //     '/events',
    //   )
    //   .then((response) => {
    //     this.logger.log(
    //       `registered event handlers with response ${JSON.stringify(response)}`,
    //     );
    //   });
  }

  /**
   * Handle the event published by AxonServer / AxonSynapse - a callback endpoint
   * @param request
   * @param headers
   */
  @Post()
  async handle(
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
}
