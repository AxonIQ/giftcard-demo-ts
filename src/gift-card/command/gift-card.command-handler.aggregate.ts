import { GiftCardCommand } from '../api/gift-card.commands';
import { GiftCardEvent } from '../api/gift-card.events';
import { Decider, EventSourcingLockingAggregate } from '@fraktalio/fmodel-ts';
import { Injectable } from '@nestjs/common';
import { GiftCardEventRepository } from './gift-card.event-repository';
import { GiftCard } from './gift-card.command-handler';

/**
 * *** APPLICATION LAYER ***
 * ___
 * An event sourcing aggregate - a command side component that handles commands and produces/stores events.
 * ___
 * Event sourcing aggregate is using/delegating a pure `commandHandler` of type `Decider`<`C`, `S`, `E`> to handle commands and produce events.
 * In order to handle the command, aggregate needs to fetch the current state (represented as a list of events) via `GiftCardEventRepository.fetchEvents` function, and then delegate the command to the `decider` which can produce new event(s) as a result.
 * Produced events are then stored via `GiftCardEventRepository.save` function.
 * ___
 * @param c - command type that is being handled - `GiftCardCommand`
 * @param s - state type that is being evolved - `GiftCard | null`
 * @param e - event type that is being produced / a fact / an outcome of the decision - `GiftCardEvent`
 */
@Injectable()
export class GiftCardAggregate extends EventSourcingLockingAggregate<
  GiftCardCommand,
  GiftCard | null,
  GiftCardEvent,
  number
> {
  constructor(
    protected readonly commandHandler: Decider<
      GiftCardCommand,
      GiftCard | null,
      GiftCardEvent
    >,
    protected readonly eventRepository: GiftCardEventRepository,
  ) {
    super(commandHandler, eventRepository);
  }
}
