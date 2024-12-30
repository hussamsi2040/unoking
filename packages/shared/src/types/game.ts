export enum CardColor {
  Red = 'red',
  Blue = 'blue',
  Green = 'green',
  Yellow = 'yellow',
  Wild = 'wild'
}

export enum CardType {
  Number = 'number',
  Skip = 'skip',
  Reverse = 'reverse',
  DrawTwo = 'drawTwo',
  Wild = 'wild',
  WildDrawFour = 'wildDrawFour'
}

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number; // Only for number cards
}

export enum GameStatus {
  Waiting = 'waiting',
  Playing = 'playing',
  Finished = 'finished'
}

export interface Player {
  id: string;
  username: string;
  isBot: boolean;
  hand: Card[];
  isHost: boolean;
}

export interface GameState {
  id: string;
  status: GameStatus;
  players: Player[];
  currentPlayerId: string;
  direction: 1 | -1; // 1 for clockwise, -1 for counter-clockwise
  deck: Card[];
  discardPile: Card[];
  currentColor: CardColor;
  lastPlayedCard?: Card;
  winner?: string;
  settings: GameSettings;
}

export interface GameSettings {
  maxPlayers: number;
  initialCards: number;
  hostUsername: string;
  allowBots: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard';
} 