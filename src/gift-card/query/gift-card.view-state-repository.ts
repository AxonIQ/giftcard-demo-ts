import { GiftCardSummary } from './gift-card.event-handler';
import { Injectable } from '@nestjs/common';
import { ViewStateRepository } from '@fraktalio/fmodel-ts';
import { GiftCardEvent } from '../api/gift-card.events';
import { Column, Entity, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * *** ADAPTER LAYER ***
 * ___
 * Database entity
 */
@Entity()
export class GiftCardSummaryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  initialAmount: number;
  @Column()
  remainingAmount: number;
  @Column({ default: true })
  isActive: boolean;
}
/**
 * *** ADAPTER LAYER ***
 * ___
 * Database `view store` implementation
 */
@Injectable()
export class GiftCardViewStateRepository
  implements ViewStateRepository<GiftCardEvent, GiftCardSummary | null>
{
  constructor(
    @InjectRepository(GiftCardSummaryEntity)
    private readonly giftCardRepository: Repository<GiftCardSummaryEntity>,
  ) {}
  async fetchState(e: GiftCardEvent): Promise<GiftCardSummary | null> {
    return await this.giftCardRepository.findOneBy({ id: e.id });
  }

  async save(s: GiftCardSummary | null): Promise<GiftCardSummary | null> {
    if (s !== null) {
      return await this.giftCardRepository.save(s);
    }
    return s;
  }

  async findAll(): Promise<GiftCardSummary[]> {
    return await this.giftCardRepository.find();
  }

  async findById(id: string): Promise<GiftCardSummary | null> {
    return await this.giftCardRepository.findOneBy({ id: id });
  }
}
