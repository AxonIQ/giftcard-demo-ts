export type GiftCardEvent =
  | GiftCardIssuedEvent
  | GiftCardRedeemedEvent
  | GiftCardCancelledEvent;

export interface GiftCardIssuedEvent {
  kind: 'GiftCardIssuedEvent';
  id: string;
  amount: number;
}

export interface GiftCardRedeemedEvent {
  kind: 'GiftCardRedeemedEvent';
  id: string;
  amount: number;
}

export interface GiftCardCancelledEvent {
  kind: 'GiftCardCancelledEvent';
  id: string;
}
