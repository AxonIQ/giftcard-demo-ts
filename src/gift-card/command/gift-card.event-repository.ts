import { GiftCardEvent } from '../api/gift-card.events';
import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '@fraktalio/fmodel-ts';
import { GiftCardCommand } from '../api/gift-card.commands';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

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
 * Simple event storage - in memory
 */
let storage: readonly GiftCardEvent[] = [];

/**
 * *** ADAPTER LAYER ***
 * ___
 * Axon Server event store implementation - event repository implementation
 */
@Injectable()
export class GiftCardEventRepository
  implements EventRepository<GiftCardCommand, GiftCardEvent>
{
  private readonly logger = new Logger(GiftCardEventRepository.name);

  constructor(private readonly httpService: HttpService) {}
  async fetchEvents(c: GiftCardCommand): Promise<GiftCardEvent[]> {
    // https://github.com/AxonIQ/axon-synapse/issues/108
    // const { data } = await lastValueFrom(
    //   this.httpService
    //     .get<Item[]>(
    //       `http://localhost:8080/v1/contexts/default/aggregate/${c.id}/events`,
    //     )
    //     .pipe(
    //       catchError((error: AxiosError) => {
    //         this.logger.error(error.message, error.stack);
    //         throw 'An error happened!';
    //       }),
    //     ),
    // );
    // const result = data.map((it) => it.payload as GiftCardEvent);
    // this.logger.log(result);
    // return result;
    return storage.filter((e) => e.id === c.id);
  }

  async save(e: GiftCardEvent): Promise<GiftCardEvent> {
    storage = storage.concat(e);
    return e;
  }

  async saveAll(
    eList: readonly GiftCardEvent[],
  ): Promise<readonly GiftCardEvent[]> {
    storage = storage.concat(eList);
    return eList;
  }
}
