export type GiftCardQuery = FindByIdQuery | FindAllQuery;
export interface FindByIdQuery {
  kind: 'FindByIdQuery';
  id: string;
}

export interface FindAllQuery {
  kind: 'FindAllQuery';
}
