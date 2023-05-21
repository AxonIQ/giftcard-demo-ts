import { Decider, IDecider } from '@fraktalio/fmodel-ts';
import { GiftCardCommand } from '../api/gift-card.commands';
import { GiftCardEvent } from '../api/gift-card.events';
import { Logger } from '@nestjs/common';

/**
 * *** DOMAIN LAYER ***
 * ___
 * Gift card state / a data class that holds the current state of the gift card
 */
export class GiftCard {
  constructor(readonly id: string, readonly remainingAmount: number) {}
}
const logger = new Logger('GiftCardCommandHandler');
/**
 * *** DOMAIN LAYER ***
 * ___
 * Gift card `pure` event-sourced command handler / a decision-making component
 * ___
 * A pure command handling algorithm, responsible for evolving the state of the gift card.
 * It does not produce any side effects, such as I/O, logging, etc.
 * It utilizes type narrowing to make sure that the command is handled exhaustively.
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
 * ___
 * @param c - command type that is being handled - `GiftCardCommand`
 * @param s - state type that is being evolved - `GiftCard | null`
 * @param e - event type that is being produced / a fact / an outcome of the decision - `GiftCardEvent`
 */
export const giftCardCommandHandler: IDecider<
  GiftCardCommand,
  GiftCard | null,
  GiftCardEvent
> = new Decider<GiftCardCommand, GiftCard | null, GiftCardEvent>(
  (c, s) => {
    switch (c.kind) {
      case 'IssueGiftCardCommand':
        logger.log(`issued gift card ${c.id} successfully`);
        return [
          {
            kind: 'GiftCardIssuedEvent',
            id: c.id,
            amount: c.amount,
          },
        ];
      case 'RedeemGiftCardCommand':
        logger.log(`redeemed gift card ${c.id} successfully`);
        return s !== null
          ? [
              {
                kind: 'GiftCardRedeemedEvent',
                id: c.id,
                amount: c.amount,
              },
            ]
          : [];
      case 'CancelGiftCardCommand':
        logger.log(`canceled gift card ${c.id} successfully`);
        return s !== null
          ? [
              {
                kind: 'GiftCardCancelledEvent',
                id: c.id,
              },
            ]
          : [];
      default:
        // Exhaustive matching of the command type
        const _: never = c;
        logger.log('Never just happened in command handler: ' + _);
        return [];
    }
  },
  // Exhaustive matching of the event type
  (s, e) => {
    switch (e.kind) {
      case 'GiftCardIssuedEvent':
        return new GiftCard(e.id, e.amount);
      case 'GiftCardRedeemedEvent':
        return s !== null
          ? new GiftCard(s.id, s.remainingAmount - e.amount)
          : s;
      case 'GiftCardCancelledEvent':
        return s !== null ? new GiftCard(s.id, 0) : s;
      default:
        const _: never = e;
        console.log('Never just happened in event sourcing handler: ' + _);
        return s;
    }
  },
  null,
);
