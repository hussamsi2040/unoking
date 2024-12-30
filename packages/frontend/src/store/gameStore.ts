import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameState, GameSettings, Card } from '@uno-king/shared';

interface GameStore {
  // Socket connection
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;

  // Game state
  gameState: GameState | null;
  playerId: string | null;
  gameId: string | null;
  isHost: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  createGame: (settings: GameSettings) => void;
  joinGame: (gameId: string, username: string) => void;
  startGame: () => void;
  playCard: (card: Card) => void;
  drawCard: () => void;
  callUno: () => void;
  leaveGame: () => void;
  clearError: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  socket: null,
  gameState: null,
  playerId: null,
  gameId: null,
  isHost: false,
  isLoading: false,
  error: null,

  // Socket connection
  connect: () => {
    set({ isLoading: true, error: null });
    const socket = io('/');
    
    socket.on('connect', () => {
      set({ playerId: socket.id, isLoading: false });
    });

    socket.on('connect_error', () => {
      set({ error: 'Failed to connect to server', isLoading: false });
    });

    socket.on('game:state', (state: GameState) => {
      set({ gameState: state, isLoading: false });
    });

    socket.on('game:error', (message: string) => {
      set({ error: message, isLoading: false });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        gameState: null,
        playerId: null,
        gameId: null,
        isHost: false,
        error: null,
      });
    }
  },

  // Game actions
  createGame: (settings: GameSettings) => {
    const { socket } = get();
    if (socket) {
      set({ isLoading: true, error: null });
      socket.emit('create:game', settings);
      set({ isHost: true });
    } else {
      set({ error: 'Not connected to server' });
    }
  },

  joinGame: (gameId: string, username: string) => {
    const { socket } = get();
    if (socket) {
      set({ isLoading: true, error: null });
      socket.emit('join:game', { gameId, username });
      set({ gameId });
    } else {
      set({ error: 'Not connected to server' });
    }
  },

  startGame: () => {
    const { socket, isHost } = get();
    if (socket && isHost) {
      set({ isLoading: true, error: null });
      socket.emit('start:game');
    } else {
      set({ error: 'Not authorized to start game' });
    }
  },

  playCard: (card: Card) => {
    const { socket } = get();
    if (socket) {
      set({ isLoading: true, error: null });
      socket.emit('play:card', card.id);
    } else {
      set({ error: 'Not connected to server' });
    }
  },

  drawCard: () => {
    const { socket } = get();
    if (socket) {
      set({ isLoading: true, error: null });
      socket.emit('draw:card');
    } else {
      set({ error: 'Not connected to server' });
    }
  },

  callUno: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('call:uno');
    } else {
      set({ error: 'Not connected to server' });
    }
  },

  leaveGame: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('leave:game');
      set({
        gameState: null,
        gameId: null,
        isHost: false,
        error: null,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
})); 