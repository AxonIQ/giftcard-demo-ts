import { IView, View } from '@fraktalio/fmodel-ts';
import { GiftCardEvent } from '../api/gift-card.events';
import { Logger } from '@nestjs/common';

/**
 * *** DOMAIN LAYER ***
 * ___
 * Gift card view state / a data class that holds the current view state of the gift card.
 */
export class GiftCardSummary {
  constructor(
    readonly id: string,
    readonly initialAmount: number,
    readonly remainingAmount: number,
    readonly isActive: boolean = true,
  ) {}
}
const logger = new Logger('GiftCardEventHandler');
/**
 * *** DOMAIN LAYER ***
 * ___
 * A pure event handling algorithm, responsible for translating the events into denormalized view state, which is more adequate for querying.
 * ___
 * It does not produce any side effects, such as I/O, logging, etc.
 * It utilizes type narrowing to make sure that the event is handled exhaustively.
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
 * ___
 * @param s - a view state that is being evolved out of the events - `GiftCardSummary | null`
 * @param e - event type that is being handled - `GiftCardEvent`
 */
export const giftCardEventHandler: IView<
  GiftCardSummary | null,
  GiftCardEvent
> = new View<GiftCardSummary | null, GiftCardEvent>((s, e) => {
  switch (e.kind) {
    case 'GiftCardIssuedEvent':
      logger.log(`GiftCardIssuedEvent event ${e.id} handled successfully`);
      return new GiftCardSummary(e.id, e.amount, e.amount);
    case 'GiftCardRedeemedEvent':
      logger.log(`GiftCardRedeemedEvent event ${e.id} handled successfully`);
      return s !== null
        ? new GiftCardSummary(
            s.id,
            s.initialAmount,
            s.remainingAmount - e.amount,
          )
        : s;
    case 'GiftCardCancelledEvent':
      logger.log(`GiftCardCancelledEvent event ${e.id} handled successfully`);
      return s !== null
        ? new GiftCardSummary(s.id, s.initialAmount, 0, false)
        : s;
    default:
      // Exhaustive matching of the event type
      const _: never = e;
      logger.log('Never just happened in event handler: ' + _);
      return s;
  }
}, null);
