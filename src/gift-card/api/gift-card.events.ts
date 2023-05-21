export type GiftCardEvent =
  | GiftCardIssuedEvent
  | GiftCardRedeemedEvent
  | GiftCardCancelledEvent;

export interface GiftCardIssuedEvent {
  kind: 'GiftCardIssuedEvent';
  id: string;
  amount: number;
}

export class GiftCardRedeemedEvent {
  kind: 'GiftCardRedeemedEvent';
  id: string;
  amount: number;
}

export class GiftCardCancelledEvent {
  kind: 'GiftCardCancelledEvent';
  id: string;
}
