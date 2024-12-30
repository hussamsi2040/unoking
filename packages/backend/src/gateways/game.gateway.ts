import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from '../game/game.service';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  GameState,
  GameSettings,
  Card,
  CardColor,
  Player
} from '@uno-king/shared';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server<ClientToServerEvents, ServerToClientEvents, any, SocketData>;
  
  private playerSockets: Map<string, Socket> = new Map();

  constructor(private readonly gameService: GameService) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.handlePlayerDisconnect(client);
  }

  private broadcastGameState(gameId: string) {
    const game = this.gameService.getGame(gameId);
    if (!game) return;

    this.server.to(gameId).emit('game:state', game);
  }

  @SubscribeMessage('create:game')
  async handleCreateGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() settings: GameSettings
  ) {
    try {
      const { gameId, playerId } = await this.gameService.createGame(settings);
      
      client.data.gameId = gameId;
      client.data.playerId = playerId;
      await client.join(gameId);
      
      this.playerSockets.set(playerId, client);
      this.broadcastGameState(gameId);
    } catch (error) {
      client.emit('game:error', error.message);
    }
  }

  @SubscribeMessage('join:game')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; username: string; isBot?: boolean }
  ) {
    try {
      const playerId = await this.gameService.joinGame(data.gameId, data.username, data.isBot ?? false);
      
      client.data.gameId = data.gameId;
      client.data.playerId = playerId;
      await client.join(data.gameId);
      
      this.playerSockets.set(playerId, client);
      this.broadcastGameState(data.gameId);
    } catch (error) {
      client.emit('game:error', error.message);
    }
  }

  @SubscribeMessage('start:game')
  async handleStartGame(@ConnectedSocket() client: Socket) {
    try {
      const { gameId } = client.data;
      if (!gameId) throw new Error('Not in a game');

      await this.gameService.startGame(gameId);
      this.broadcastGameState(gameId);
    } catch (error) {
      client.emit('game:error', error.message);
    }
  }

  @SubscribeMessage('play:card')
  async handlePlayCard(
    @ConnectedSocket() client: Socket,
    @MessageBody() cardId: string
  ) {
    try {
      const { gameId, playerId } = client.data;
      if (!gameId || !playerId) throw new Error('Not in a game');

      await this.gameService.playCard(gameId, playerId, cardId);
      this.broadcastGameState(gameId);
    } catch (error) {
      client.emit('game:error', error.message);
    }
  }

  @SubscribeMessage('draw:card')
  async handleDrawCard(@ConnectedSocket() client: Socket) {
    try {
      const { gameId, playerId } = client.data;
      if (!gameId || !playerId) throw new Error('Not in a game');

      await this.gameService.drawCard(gameId, playerId);
      this.broadcastGameState(gameId);
    } catch (error) {
      client.emit('game:error', error.message);
    }
  }

  @SubscribeMessage('call:uno')
  async handleCallUno(@ConnectedSocket() client: Socket) {
    try {
      const { gameId, playerId } = client.data;
      if (!gameId || !playerId) throw new Error('Not in a game');

      await this.gameService.callUno(gameId, playerId);
      this.broadcastGameState(gameId);
    } catch (error) {
      client.emit('game:error', error.message);
    }
  }

  @SubscribeMessage('leave:game')
  async handleLeaveGame(@ConnectedSocket() client: Socket) {
    try {
      const { gameId, playerId } = client.data;
      if (!gameId || !playerId) throw new Error('Not in a game');

      await this.gameService.leaveGame(gameId, playerId);
      await client.leave(gameId);
      
      client.data.gameId = undefined;
      client.data.playerId = undefined;
      this.playerSockets.delete(playerId);
      
      this.broadcastGameState(gameId);
    } catch (error) {
      client.emit('game:error', error.message);
    }
  }

  private async handlePlayerDisconnect(client: Socket) {
    const { gameId, playerId } = client.data;
    if (!gameId || !playerId) return;

    try {
      await this.gameService.leaveGame(gameId, playerId);
      await client.leave(gameId);
      
      client.data.gameId = undefined;
      client.data.playerId = undefined;
      this.playerSockets.delete(playerId);
      
      this.broadcastGameState(gameId);
    } catch (error) {
      console.error('Error handling player disconnect:', error);
    }
  }
} 