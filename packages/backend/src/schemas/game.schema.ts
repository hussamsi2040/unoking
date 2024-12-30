import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Card, CardColor, CardType, GameSettings, GameStatus, Player } from '@uno-king/shared';

@Schema({ timestamps: true })
export class Game extends Document {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, enum: GameStatus })
  status: GameStatus;

  @Prop({ type: [Object], required: true })
  players: Player[];

  @Prop({ required: true })
  currentPlayerId: string;

  @Prop({ required: true, enum: [1, -1], default: 1 })
  direction: 1 | -1;

  @Prop({ type: [Object], required: true })
  deck: Card[];

  @Prop({ type: [Object], required: true })
  discardPile: Card[];

  @Prop({ required: true, enum: CardColor })
  currentColor: CardColor;

  @Prop({ type: Object })
  lastPlayedCard?: Card;

  @Prop()
  winner?: string;

  @Prop({ type: Object, required: true })
  settings: GameSettings;
}

export const GameSchema = SchemaFactory.createForClass(Game); 