import React from 'react';
import { Box, Button, Typography, Stack, Paper } from '@mui/material';
import { useGameStore } from '../store/gameStore';
import { PlayerHand } from './PlayerHand';
import { GameCard } from './GameCard';

export const GameBoard: React.FC = () => {
  const { gameState, playerId, drawCard, callUno, playCard } = useGameStore();

  if (!gameState || !playerId) {
    return null;
  }

  const currentPlayer = gameState.players.find((p) => p.id === playerId);
  const isCurrentTurn = gameState.currentPlayerId === playerId;

  return (
    <Box sx={{ height: '100vh', p: 2, position: 'relative' }}>
      {/* Game Info */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6">
            Current Player: {gameState.players.find((p) => p.id === gameState.currentPlayerId)?.username}
          </Typography>
          <Typography variant="h6">
            Direction: {gameState.direction === 1 ? 'Clockwise' : 'Counter-Clockwise'}
          </Typography>
          <Typography variant="h6">
            Cards in Deck: {gameState.deck.length}
          </Typography>
        </Stack>
      </Paper>

      {/* Other Players */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        {gameState.players
          .filter((p) => p.id !== playerId)
          .map((player) => (
            <Paper key={player.id} sx={{ p: 2 }}>
              <Typography variant="subtitle1">{player.username}</Typography>
              <Typography variant="body2">Cards: {player.hand.length}</Typography>
            </Paper>
          ))}
      </Stack>

      {/* Game Actions */}
      <Box sx={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)' }}>
        <Stack spacing={2}>
          <Button
            variant="contained"
            onClick={drawCard}
            disabled={!isCurrentTurn}
          >
            Draw Card
          </Button>
          <Button
            variant="contained"
            onClick={callUno}
            disabled={!currentPlayer || currentPlayer.hand.length !== 2}
          >
            Call UNO!
          </Button>
        </Stack>
      </Box>

      {/* Discard Pile */}
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {gameState.lastPlayedCard && (
          <Box sx={{ position: 'relative' }}>
            <GameCard card={gameState.lastPlayedCard} />
            <Typography
              variant="h6"
              sx={{
                position: 'absolute',
                top: -40,
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'text.secondary',
              }}
            >
              Current Color: {gameState.currentColor}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Player's Hand */}
      {currentPlayer && (
        <PlayerHand
          cards={currentPlayer.hand}
          isCurrentPlayer={isCurrentTurn}
          onPlayCard={playCard}
        />
      )}
    </Box>
  );
}; 