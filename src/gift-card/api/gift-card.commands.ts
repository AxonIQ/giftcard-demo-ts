export type GiftCardCommand =
  | IssueGiftCardCommand
  | RedeemGiftCardCommand
  | CancelGiftCardCommand;

export interface IssueGiftCardCommand {
  kind: 'IssueGiftCardCommand';
  id: string;
  amount: number;
}

export interface RedeemGiftCardCommand {
  kind: 'RedeemGiftCardCommand';
  id: string;
  amount: number;
}

export interface CancelGiftCardCommand {
  kind: 'CancelGiftCardCommand';
  id: string;
}
