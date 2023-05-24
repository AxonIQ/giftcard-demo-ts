import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  CancelGiftCardCommand,
  IssueGiftCardCommand,
  RedeemGiftCardCommand,
} from '../api/gift-card.commands';
import { GiftCardEvent } from '../api/gift-card.events';
import { GiftCardSummary } from '../query/gift-card.event-handler';
import { GiftCardViewStateRepository } from '../query/gift-card.view-state-repository';
import { GiftCardCommandGateway } from '../command/gift-card.command-gateway';

/**
 * *** ADAPTER LAYER ***
 * ___
 * A controller - the entry point for all gift card commands/requests and queries, facing the users of the gift card service
 */
@Controller('gift-card')
export class GiftCardController {
  private readonly logger = new Logger(GiftCardController.name);
  constructor(
    private readonly giftCardViewStateRepository: GiftCardViewStateRepository,
    private readonly giftCardCommandGateway: GiftCardCommandGateway,
  ) {}

  @Post()
  async issue(
    @Body() request: IssueGiftCardCommand,
  ): Promise<readonly [GiftCardEvent, number][]> {
    this.logger.log(
      `issuing gift card ${request.id} with amount ${request.amount}`,
    );
    try {
      return await this.giftCardCommandGateway.publishCommand(request);
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('redeem')
  async redeem(
    @Body() request: RedeemGiftCardCommand,
  ): Promise<readonly [GiftCardEvent, number][]> {
    this.logger.log(
      `redeeming gift card ${request.id} with amount ${request.amount}`,
    );
    try {
      return await this.giftCardCommandGateway.publishCommand(request);
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async cancel(
    @Param('id') id: string,
  ): Promise<readonly [GiftCardEvent, number][]> {
    const command: CancelGiftCardCommand = {
      kind: 'CancelGiftCardCommand',
      id: id,
    };
    this.logger.log(`canceling gift card ${command.id}`);
    try {
      return await this.giftCardCommandGateway.publishCommand(command);
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  find(): Promise<readonly GiftCardSummary[] | null> {
    return this.giftCardViewStateRepository.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<GiftCardSummary | null> {
    return this.giftCardViewStateRepository.findById(id);
  }
}
