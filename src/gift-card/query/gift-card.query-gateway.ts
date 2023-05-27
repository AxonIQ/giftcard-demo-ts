import { Injectable, Logger } from '@nestjs/common';
import { GiftCardCommand } from '../api/gift-card.commands';
import { GiftCardEvent } from '../api/gift-card.events';
import { AxonClient } from '../../axon.client';
import { ConfigService } from '@nestjs/config';
import { GiftCardQuery } from '../api/gift-card.queries';
import { GiftCardSummary } from './gift-card.event-handler';

export type QueryResponseCardinality = 'single' | 'multiple';
/**
 * *** ADAPTER LAYER ***
 * ___
 * A query gateway
 * ___
 * A component responsible for publishing queries to Axon Synapse, over HTTP protocol
 */
@Injectable()
export class GiftCardQueryGateway {
  private readonly logger = new Logger(GiftCardQueryGateway.name);
  constructor(
    private readonly axonClient: AxonClient<
      GiftCardCommand,
      GiftCardEvent,
      GiftCardQuery
    >,
    private readonly configService: ConfigService,
  ) {}

  async publishQuery(
    q: GiftCardQuery,
    cardinality: QueryResponseCardinality,
    contextProvider: (q: GiftCardQuery) => string = () =>
      this.configService.get<string>('AXON_CONTEXT', 'default'),
  ): Promise<readonly GiftCardSummary[] | GiftCardSummary | null> {
    this.logger.log(
      `dispatching query ${q.kind} with body ${JSON.stringify(q)}`,
    );
    return await this.axonClient.publishQuery<GiftCardSummary>(
      q,
      () => q.kind,
      () => 'GiftCardSummary',
      () => 'multiple',
      contextProvider,
    );
  }
}
