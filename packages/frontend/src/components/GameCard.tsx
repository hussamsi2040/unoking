import React from 'react';
import { Card, CardContent, Typography, Box, keyframes } from '@mui/material';
import { Card as CardType, CardColor } from '@uno-king/shared';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

interface GameCardProps {
  card: CardType;
  isPlayable?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

const getCardColor = (color: CardColor) => {
  switch (color) {
    case CardColor.Red:
      return '#D32F2F';
    case CardColor.Blue:
      return '#1976D2';
    case CardColor.Green:
      return '#388E3C';
    case CardColor.Yellow:
      return '#FBC02D';
    case CardColor.Wild:
      return '#9E9E9E';
  }
};

export const GameCard: React.FC<GameCardProps> = ({
  card,
  isPlayable = false,
  onClick,
  isSelected = false,
}) => {
  const backgroundColor = getCardColor(card.color);

  return (
    <Card
      sx={{
        width: 120,
        height: 180,
        backgroundColor,
        cursor: isPlayable ? 'pointer' : 'default',
        transform: isSelected ? 'translateY(-20px)' : 'none',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': isPlayable
          ? {
              animation: `${float} 1s ease-in-out infinite`,
              transform: 'scale(1.05)',
            }
          : {},
      }}
      onClick={isPlayable ? onClick : undefined}
    >
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}
        >
          {card.type === 'number' ? card.value : card.type.charAt(0).toUpperCase()}
        </Box>

        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {card.type === 'number' ? card.value : card.type}
        </Typography>

        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            transform: 'rotate(180deg)',
          }}
        >
          {card.type === 'number' ? card.value : card.type.charAt(0).toUpperCase()}
        </Box>
      </CardContent>
    </Card>
  );
}; 