import { GiftCardEvent } from '../api/gift-card.events';
import { Injectable, Logger } from '@nestjs/common';
import {
  EventLockingRepository,
  LatestVersionProvider,
} from '@fraktalio/fmodel-ts';
import { GiftCardCommand } from '../api/gift-card.commands';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

export interface Data {
  items: Item[];
}
export interface Item {
  id: string;
  metaData: MetaData;
  payload: object;
  payloadType: string;
  payloadRevision: string;
  name: string;
  aggregateId: string;
  aggregateType: string;
  sequenceNumber: number;
  index: number;
}
export interface MetaData {
  'some key': string;
  'another key': string;
}

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
  private context = 'default';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  async fetchEvents(c: GiftCardCommand): Promise<[GiftCardEvent, number][]> {
    const { data } = await lastValueFrom(
      this.httpService
        .get<Data>(
          `http://localhost:8080/v1/contexts/default/aggregate/${c.id}/events`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message, error.stack);
            throw error;
          }),
        ),
    );
    this.logger.log(
      `fetched events for aggregate ${c.id}: ${JSON.stringify(
        data.items.map((it) => [it.payload, it.sequenceNumber]),
      )}`,
    );
    return data.items.map((it) => [
      it.payload as GiftCardEvent,
      it.sequenceNumber,
    ]);
  }

  async save(
    e: GiftCardEvent,
    latestVersion: number | null,
  ): Promise<[GiftCardEvent, number]> {
    const event: [GiftCardEvent, number] = [
      e,
      latestVersion != null ? latestVersion + 1 : 0,
    ];
    const headersRequest = {
      'Content-Type': 'application/json',
      'AxonIQ-AggregateType': 'Giftcard',
      'AxonIQ-AggregateId': e.id,
      'AxonIQ-SequenceNumber': event[1],
    };
    const axonApiUrl = this.configService.get<string>(
      'AXON_API_URL',
      'http://localhost:8080/v1',
    );
    const URL = `${axonApiUrl}/contexts/${this.context}/events/${e.kind}`;
    await firstValueFrom(
      this.httpService
        .post<[GiftCardEvent, number]>(URL, e, { headers: headersRequest })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message, error.stack);
            throw error;
          }),
        ),
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
