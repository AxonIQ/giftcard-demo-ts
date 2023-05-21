import { GiftCardEvent } from '../api/gift-card.events';
import { MaterializedView, View } from '@fraktalio/fmodel-ts';
import { GiftCardSummary } from './gift-card.event-handler';
import { Injectable } from '@nestjs/common';
import { GiftCardViewStateRepository } from './gift-card.view-state-repository';

/**
 * *** APPLICATION LAYER ***
 * ___
 * A materialized view implementation - query side component tha handles event and produces and store denormalized state which is adequate for the querying purposes.
 * ___
 * Materialized view is using/delegating a pure `eventHandler` of type `View`<`S`, `E`> to handle events and produce/store denormalized view state.
 * In order to handle the event, materialized view needs to fetch the current view state via `GiftCardViewStateRepository.fetchState` function, and then delegate the event to the `eventHandler/view` which can produce new state as a result.
 * Produced state is then stored via `GiftCardViewStateRepository.save` function.
 * ___
 * @param s - state type that is being evolved - `GiftCardSummary | null`
 * @param e - event type that is being handled - `GiftCardEvent`
 */
@Injectable()
export class GiftCardMaterializedView extends MaterializedView<
  GiftCardSummary | null,
  GiftCardEvent
> {
  constructor(
    protected readonly eventHandler: View<
      GiftCardSummary | null,
      GiftCardEvent
    >,
    protected readonly viewStateRepository: GiftCardViewStateRepository,
  ) {
    super(eventHandler, viewStateRepository);
  }
}
