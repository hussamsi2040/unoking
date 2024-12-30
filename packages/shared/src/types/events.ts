import { Card, GameSettings, GameState, Player } from './game.js';

// Server -> Client Events
export interface ServerToClientEvents {
  'game:state': (state: GameState) => void;
  'game:error': (message: string) => void;
}

// Client -> Server Events
export interface ClientToServerEvents {
  'create:game': (settings: GameSettings) => void;
  'join:game': (data: { gameId: string; username: string; isBot?: boolean }) => void;
  'start:game': () => void;
  'play:card': (cardId: string) => void;
  'draw:card': () => void;
  'call:uno': () => void;
  'leave:game': () => void;
}

// Socket Data
export interface SocketData {
  gameId?: string;
  playerId?: string;
} 