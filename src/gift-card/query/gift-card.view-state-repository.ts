import { GiftCardSummary } from './gift-card.event-handler';
import { Injectable } from '@nestjs/common';
import { ViewStateRepository } from '@fraktalio/fmodel-ts';
import { GiftCardEvent } from '../api/gift-card.events';

/**
 * *** ADAPTER LAYER ***
 * ___
 * Very simple storage
 */
let giftCardStorage: GiftCardSummary[] = [];

/**
 * *** ADAPTER LAYER ***
 * ___
 * In-memory view store implementation - default, simple and not very efficient
 */
@Injectable()
export class GiftCardViewStateRepository
  implements ViewStateRepository<GiftCardEvent, GiftCardSummary | null>
{
  async fetchState(e: GiftCardEvent): Promise<GiftCardSummary | null> {
    return await this.findById(e.id);
  }

  async save(s: GiftCardSummary | null): Promise<GiftCardSummary | null> {
    if (s !== null) {
      const giftCardSummary = giftCardStorage
        .filter((it) => s.id === it.id)
        .map(
          (it) =>
            new GiftCardSummary(it.id, s.initialAmount, s.remainingAmount),
        )[0];
      if (giftCardSummary === undefined) {
        giftCardStorage = giftCardStorage.concat(s);
      }
    }
    return s;
  }

  readonly findById: (id: string) => Promise<GiftCardSummary | null> = async (
    id: string,
  ) => giftCardStorage.find((giftCard) => giftCard.id === id) ?? null;

  readonly findAll: () => Promise<GiftCardSummary[]> = async () =>
    giftCardStorage;
}
