import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { GiftCardCommand } from '../api/gift-card.commands';
import { GiftCardAggregate } from './gift-card.command-handler.aggregate';
import { AXONIQ_COMMANDNAME } from '../../app.module';
import { AxonClient } from '../../axon.client';
import { GiftCardEvent } from '../api/gift-card.events';

/**
 * *** ADAPTER LAYER ***
 * ___
 * A command controller
 * ___
 * Callback entry point for all gift card commands that are published/posted by the Axon Server/Axon Synapse
 */
@Controller('commands')
export class GiftCardCommandHandlerController implements OnModuleInit {
  private readonly logger = new Logger(GiftCardCommandHandlerController.name);
  constructor(
    private readonly giftCardAggregate: GiftCardAggregate,
    private readonly axonClient: AxonClient<GiftCardCommand, GiftCardEvent>,
  ) {}

  /**
   * Register the command handler for the `default` context - on module initialization
   */
  async onModuleInit(): Promise<void> {
    return await this.axonClient
      .registerCommandHandler(
        '7ec558ec-90c4-4d51-b444-a028830257bb',
        [
          'IssueGiftCardCommand',
          'RedeemGiftCardCommand',
          'CancelGiftCardCommand',
        ],
        'giftcard-demo-1',
        'Giftcard',
        '/commands',
      )
      .then((response) => {
        this.logger.log(
          `registered command handlers with response ${JSON.stringify(
            response,
          )}`,
        );
      });
  }

  /**
   * Handle the command published by AxonServer / AxonSynapse - a callback endpoint
   * @param request
   * @param headers
   */
  @Post()
  async handle(
    @Body() request: GiftCardCommand,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log(
      `received command ${
        headers[AXONIQ_COMMANDNAME]
      } with body ${JSON.stringify(request)} and headers ${JSON.stringify(
        headers,
      )}`,
    );
    return await this.giftCardAggregate.handle(request);
  }
}
