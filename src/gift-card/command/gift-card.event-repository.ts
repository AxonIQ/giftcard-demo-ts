import { GiftCardEvent } from '../api/gift-card.events';
import { Injectable, Logger } from '@nestjs/common';
import {
  EventLockingRepository,
  LatestVersionProvider,
} from '@fraktalio/fmodel-ts';
import { GiftCardCommand } from '../api/gift-card.commands';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxonClient } from '../../axon.client';

/**
 * *** ADAPTER LAYER ***
 * ___
 * Axon Server event store implementation - event repository implementation
 */
@Injectable()
export class GiftCardEventRepository
  implements EventLockingRepository<GiftCardCommand, GiftCardEvent, number>
{
  private readonly logger = new Logger(GiftCardEventRepository.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly axonClient: AxonClient<GiftCardCommand, GiftCardEvent>,
  ) {}
  async fetchEvents(c: GiftCardCommand): Promise<[GiftCardEvent, number][]> {
    const result = await this.axonClient.fetchAggregateEvents(c, (c) => c.id);
    this.logger.log(
      `fetched events for aggregate ${c.id}: ${JSON.stringify(result)}`,
    );
    return result;
  }

  async save(
    e: GiftCardEvent,
    latestVersion: number | null,
  ): Promise<[GiftCardEvent, number]> {
    const event = await this.axonClient.appendEvent(
      e,
      (e) => e.id,
      () => 'Giftcard',
      (e) => e.kind,
      latestVersion,
    );
    this.logger.log(
      `appended/saved event ${e.kind} with body ${JSON.stringify(e)}`,
    );
    return event;
  }

  async saveAll(
    eList: readonly GiftCardEvent[],
    latestVersion: number | null,
  ): Promise<readonly [GiftCardEvent, number][]> {
    let version = latestVersion != null ? latestVersion : -1;
    const result = eList.map(async (e) => {
      return await this.save(e, version++);
    });
    return Promise.all(result);
  }

  latestVersionProvider(e: GiftCardEvent): number | null {
    throw new Error('Method not implemented.');
  }

  async saveAllByLatestVersionProvided(
    eList: GiftCardEvent[],
    latestVersionProvider: LatestVersionProvider<GiftCardEvent, number>,
  ): Promise<readonly [GiftCardEvent, number][]> {
    throw new Error('Method not implemented.');
  }

  async saveByLatestVersionProvided(
    e: GiftCardEvent,
    latestVersionProvider: LatestVersionProvider<GiftCardEvent, number>,
  ): Promise<readonly [GiftCardEvent, number]> {
    throw new Error('Method not implemented.');
  }
}
