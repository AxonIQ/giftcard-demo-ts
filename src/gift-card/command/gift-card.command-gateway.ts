import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GiftCardCommand } from '../api/gift-card.commands';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { GiftCardEvent } from '../api/gift-card.events';

/**
 * *** ADAPTER LAYER ***
 * ___
 * A command gateway
 * ___
 * A component responsible for publishing commands to Axon Synapse, over HTTP protocol
 */
@Injectable()
export class GiftCardCommandGateway {
  private readonly logger = new Logger(GiftCardCommandGateway.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async publishCommand(
    c: GiftCardCommand,
    context = 'default',
  ): Promise<readonly [GiftCardEvent, number][]> {
    const headersRequest = {
      'Content-Type': 'application/json',
      'AxonIQ-PayloadType': c.kind,
      'AxonIQ-RoutingKey': c.id,
    };
    const axonApiUrl = this.configService.get<string>(
      'AXON_API_URL',
      'http://localhost:8080/v1',
    );
    const URL = `${axonApiUrl}/contexts/${context}/commands/${c.kind}`;
    this.logger.log(
      `dispatching command ${c.kind} with body ${JSON.stringify(c)}`,
    );
    const { data } = await firstValueFrom(
      this.httpService
        .post<[GiftCardEvent, number][]>(URL, c, { headers: headersRequest })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message, error.stack);
            throw error;
          }),
        ),
    );
    return data;
  }
}
