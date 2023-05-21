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
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

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
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register the gift card event handler for the `default` context - on module initialization
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
      'AXON_EVENT_CALLBACK_ENDPOINT',
      'http://localhost:3000/events',
    );
    const request = {
      names: [
        'GiftCardIssuedEvent',
        'GiftCardRedeemedEvent',
        'GiftCardCanceledEvent',
      ],
      endpoint: callbackEndpoint,
      endpointType: 'http-raw',
      clientId: 'giftcard-demo-1',
      componentName: 'Giftcard',
    };
    const URL = `${axonApiUrl}/contexts/${axonContext}/handlers/events/77078a9e-1b3f-4d3b-a801-39e218835c90`;
    this.logger.log(
      `registering event handlers for context ${axonContext} at ${URL}, with body ${JSON.stringify(
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
   * Handle the event published by AxonServer / AxonSynapse - a callback endpoint
   * @param request
   * @param headers
   */
  @Post()
  handle(
    @Body() request: GiftCardEvent,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log(
      `received event ${headers[AXONIQ_EVENTNAME]} with body ${JSON.stringify(
        request,
      )} and headers ${JSON.stringify(headers)}`,
    );
    return this.giftCardAMaterializedView.handle(request);
  }
}
