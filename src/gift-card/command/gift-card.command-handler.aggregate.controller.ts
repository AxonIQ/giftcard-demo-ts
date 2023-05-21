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
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

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
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register the command handler for the `default` context - on module initialization
   */
  async onModuleInit(): Promise<void> {
    const headersRequest = {
      'Content-Type': 'application/json',
    };
    const axonApiUrl = this.configService.get<string>(
      'AXON_API_URL',
      'http://localhost:8080/v1',
    );
    const axonContext = this.configService.get<string>(
      'AXON_CONTEXT',
      'default',
    );
    const callbackEndpoint = this.configService.get<string>(
      'AXON_COMMAND_CALLBACK_ENDPOINT',
      'http://localhost:3000/commands',
    );
    const request = {
      names: [
        'IssueGiftCardCommand',
        'RedeemGiftCardCommand',
        'CancelGiftCardCommand',
      ],
      endpoint: callbackEndpoint,
      endpointType: 'http-raw',
      clientId: 'giftcard-demo-1',
      componentName: 'Giftcard',
    };
    const URL = `${axonApiUrl}/contexts/${axonContext}/handlers/commands/7ec558ec-90c4-4d51-b444-a028830257bb`;
    this.logger.log(
      `registering command handlers for context ${axonContext} at ${URL}, with body ${JSON.stringify(
        request,
      )}`,
    );
    await firstValueFrom(
      this.httpService
        .put<void>(URL, request, { headers: headersRequest })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message, error.stack);
            throw error;
          }),
        ),
    );
  }

  /**
   * Handle the command published by AxonServer / AxonSynapse - a callback endpoint
   * @param request
   * @param headers
   */
  @Post()
  handle(
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
    return this.giftCardAggregate.handle(request);
  }
}
