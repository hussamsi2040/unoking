import { v4 as uuidv4 } from 'uuid';
import { GameSettings, GameState, GameStatus, Card, CardColor, CardType, Player } from '@uno-king/shared';

export class Game {
  private id: string;
  private status: GameStatus;
  private players: Player[];
  private currentPlayerId: string;
  private direction: 1 | -1;
  private deck: Card[];
  private discardPile: Card[];
  private currentColor: CardColor;
  private winner?: string;
  private settings: GameSettings;

  constructor(settings: GameSettings) {
    this.id = uuidv4();
    this.status = GameStatus.Waiting;
    this.players = [];
    this.currentPlayerId = '';
    this.direction = 1;
    this.deck = this.createDeck();
    this.discardPile = [];
    this.currentColor = CardColor.Wild;
    this.settings = settings;
  }

  private createDeck(): Card[] {
    const deck: Card[] = [];
    const colors = [CardColor.Red, CardColor.Blue, CardColor.Green, CardColor.Yellow];

    // Add number cards (0-9)
    colors.forEach(color => {
      for (let value = 0; value <= 9; value++) {
        const count = value === 0 ? 1 : 2;
        for (let i = 0; i < count; i++) {
          deck.push({
            id: uuidv4(),
            type: CardType.Number,
            color,
            value,
          });
        }
      }
    });

    // Add action cards (skip, reverse, draw2)
    colors.forEach(color => {
      [CardType.Skip, CardType.Reverse, CardType.DrawTwo].forEach(type => {
        for (let i = 0; i < 2; i++) {
          deck.push({
            id: uuidv4(),
            type,
            color,
          });
        }
      });
    });

    // Add wild cards
    for (let i = 0; i < 4; i++) {
      deck.push({
        id: uuidv4(),
        type: CardType.Wild,
        color: CardColor.Wild,
      });
      deck.push({
        id: uuidv4(),
        type: CardType.WildDrawFour,
        color: CardColor.Wild,
      });
    }

    return this.shuffleDeck(deck);
  }

  private shuffleDeck(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  public getId(): string {
    return this.id;
  }

  public addPlayer(username: string, isBot: boolean = false): string {
    if (this.players.length >= this.settings.maxPlayers) {
      throw new Error('Game is full');
    }

    if (isBot && !this.settings.allowBots) {
      throw new Error('Bots are not allowed in this game');
    }

    const playerId = uuidv4();
    this.players.push({
      id: playerId,
      username,
      hand: [],
      isBot,
      isHost: this.players.length === 0,
    });

    return playerId;
  }

  public removePlayer(playerId: string): void {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    // Return player's cards to the deck and shuffle
    const player = this.players[playerIndex];
    this.deck.push(...player.hand);
    this.deck = this.shuffleDeck(this.deck);

    this.players.splice(playerIndex, 1);

    // If it was the player's turn, move to the next player
    if (this.currentPlayerId === playerId) {
      this.nextTurn();
    }

    // If only one player remains, end the game
    if (this.players.length === 1 && this.status === GameStatus.Playing) {
      this.winner = this.players[0].id;
      this.status = GameStatus.Finished;
    }
  }

  public start(): void {
    if (this.players.length < 2) {
      throw new Error('Not enough players');
    }

    if (this.status !== GameStatus.Waiting) {
      throw new Error('Game has already started');
    }

    // Deal initial cards
    this.players.forEach(player => {
      player.hand = this.drawCards(this.settings.initialCards);
    });

    // Set up initial game state
    this.status = GameStatus.Playing;
    this.currentPlayerId = this.players[0].id;

    // Place first card
    const firstCard = this.drawCards(1)[0];
    this.discardPile.push(firstCard);
    this.currentColor = firstCard.color;
  }

  private drawCards(count: number): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (this.deck.length === 0) {
        // Reshuffle discard pile if deck is empty
        if (this.discardPile.length === 0) break;
        const lastCard = this.discardPile.pop()!;
        this.deck = this.shuffleDeck(this.discardPile);
        this.discardPile = [lastCard];
      }
      cards.push(this.deck.pop()!);
    }
    return cards;
  }

  public drawCard(playerId: string): void {
    if (this.status !== GameStatus.Playing) {
      throw new Error('Game is not in progress');
    }

    if (playerId !== this.currentPlayerId) {
      throw new Error('Not your turn');
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const cards = this.drawCards(1);
    player.hand.push(...cards);
    this.nextTurn();
  }

  public playCard(playerId: string, cardId: string): void {
    if (this.status !== GameStatus.Playing) {
      throw new Error('Game is not in progress');
    }

    if (playerId !== this.currentPlayerId) {
      throw new Error('Not your turn');
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error('Card not found in player hand');
    }

    const card = player.hand[cardIndex];
    const lastCard = this.discardPile[this.discardPile.length - 1];

    // Check if card can be played
    if (card.color !== CardColor.Wild && 
        card.color !== this.currentColor && 
        (card.type !== lastCard.type || 
         (card.type === CardType.Number && card.value !== lastCard.value))) {
      throw new Error('Invalid card');
    }

    // Play the card
    player.hand.splice(cardIndex, 1);
    this.discardPile.push(card);
    this.currentColor = card.color === CardColor.Wild ? this.currentColor : card.color;

    // Check for winner
    if (player.hand.length === 0) {
      this.winner = playerId;
      this.status = GameStatus.Finished;
      return;
    }

    // Handle special cards
    switch (card.type) {
      case CardType.Reverse:
        this.direction *= -1;
        if (this.players.length === 2) {
          this.nextTurn(); // Skip next player in 2-player game
        }
        break;
      case CardType.Skip:
        this.nextTurn(); // Skip next player
        break;
      case CardType.DrawTwo:
        const nextPlayer = this.getNextPlayer();
        nextPlayer.hand.push(...this.drawCards(2));
        this.nextTurn(); // Skip next player
        break;
      case CardType.WildDrawFour:
        const wildNextPlayer = this.getNextPlayer();
        wildNextPlayer.hand.push(...this.drawCards(4));
        this.nextTurn(); // Skip next player
        break;
    }

    this.nextTurn();
  }

  public callUno(playerId: string): void {
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    if (player.hand.length !== 1) {
      throw new Error('Can only call UNO with one card');
    }
  }

  private nextTurn(): void {
    const currentIndex = this.players.findIndex(p => p.id === this.currentPlayerId);
    let nextIndex = (currentIndex + this.direction + this.players.length) % this.players.length;
    this.currentPlayerId = this.players[nextIndex].id;
  }

  private getNextPlayer(): Player {
    const currentIndex = this.players.findIndex(p => p.id === this.currentPlayerId);
    let nextIndex = (currentIndex + this.direction + this.players.length) % this.players.length;
    return this.players[nextIndex];
  }

  public getState(): GameState {
    return {
      id: this.id,
      status: this.status,
      players: this.players,
      currentPlayerId: this.currentPlayerId,
      direction: this.direction,
      deck: this.deck,
      discardPile: this.discardPile,
      currentColor: this.currentColor,
      winner: this.winner,
      settings: this.settings,
      lastPlayedCard: this.discardPile[this.discardPile.length - 1],
    };
  }
} 