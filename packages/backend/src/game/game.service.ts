import { Injectable } from '@nestjs/common';
import { GameSettings, GameState, Card, Player } from '@uno-king/shared';
import { Game } from './game.js';

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();

  async createGame(settings: GameSettings): Promise<{ gameId: string; playerId: string }> {
    const game = new Game(settings);
    const playerId = game.addPlayer(settings.hostUsername, false);
    this.games.set(game.getId(), game);
    return { gameId: game.getId(), playerId };
  }

  getGame(gameId: string): GameState | undefined {
    const game = this.games.get(gameId);
    return game?.getState();
  }

  async joinGame(gameId: string, username: string, isBot: boolean = false): Promise<string> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    return game.addPlayer(username, isBot);
  }

  async startGame(gameId: string): Promise<void> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    game.start();
  }

  async playCard(gameId: string, playerId: string, cardId: string): Promise<void> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    game.playCard(playerId, cardId);
  }

  async drawCard(gameId: string, playerId: string): Promise<void> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    game.drawCard(playerId);
  }

  async callUno(gameId: string, playerId: string): Promise<void> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    game.callUno(playerId);
  }

  async leaveGame(gameId: string, playerId: string): Promise<void> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    game.removePlayer(playerId);
    
    // Remove the game if no players are left
    if (game.getState().players.length === 0) {
      this.games.delete(gameId);
    }
  }
} 