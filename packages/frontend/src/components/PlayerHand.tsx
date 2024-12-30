import React, { useState } from 'react';
import { Box, Stack } from '@mui/material';
import { Card as CardType } from '@uno-king/shared';
import { GameCard } from './GameCard';

interface PlayerHandProps {
  cards: CardType[];
  isCurrentPlayer: boolean;
  onPlayCard: (card: CardType) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ cards, isCurrentPlayer, onPlayCard }) => {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  const handleCardClick = (card: CardType) => {
    if (!isCurrentPlayer) return;

    if (selectedCard?.id === card.id) {
      onPlayCard(card);
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: 2,
        width: '100%',
        maxWidth: 1200,
      }}
    >
      <Stack
        direction="row"
        spacing={-2}
        sx={{
          justifyContent: 'center',
          '& > *': {
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-20px)',
              zIndex: 1,
            },
          },
        }}
      >
        {cards.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            isPlayable={isCurrentPlayer}
            onClick={() => handleCardClick(card)}
            isSelected={selectedCard?.id === card.id}
          />
        ))}
      </Stack>
    </Box>
  );
}; 