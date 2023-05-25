import { Injectable, Logger } from '@nestjs/common';
import { GiftCardCommand } from '../api/gift-card.commands';
import { GiftCardEvent } from '../api/gift-card.events';
import { AxonClient } from '../../axon.client';
import { ConfigService } from '@nestjs/config';

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
    private readonly axonClient: AxonClient<GiftCardCommand, GiftCardEvent>,
    private readonly configService: ConfigService,
  ) {}

  async publishCommand(
    c: GiftCardCommand,
    contextProvider: (c: GiftCardCommand) => string = () =>
      this.configService.get<string>('AXON_CONTEXT', 'default'),
  ): Promise<readonly [GiftCardEvent, number][]> {
    this.logger.log(
      `dispatching command ${c.kind} with body ${JSON.stringify(c)}`,
    );
    return await this.axonClient.publishCommand(
      c,
      (c) => c.kind,
      (c) => c.id,
      contextProvider,
    );
  }
}
