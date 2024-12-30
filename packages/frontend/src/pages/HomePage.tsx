import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useGameStore } from '../store/gameStore';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { connect, createGame, joinGame } = useGameStore();
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [initialCards, setInitialCards] = useState(7);
  const [allowBots, setAllowBots] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGame = () => {
    if (!username) return;

    connect();
    createGame({
      maxPlayers,
      initialCards,
      allowBots,
      botDifficulty: allowBots ? botDifficulty : undefined,
      hostUsername: username,
    });
    navigate('/game');
  };

  const handleJoinGame = () => {
    if (!username || !gameId) return;

    connect();
    joinGame(gameId, username);
    navigate('/game');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h2" align="center" gutterBottom>
          Uno King
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Play Uno with friends online!
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
          />

          {isJoining ? (
            <TextField
              label="Game ID"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              fullWidth
              required
            />
          ) : (
            <>
              <FormControl fullWidth>
                <InputLabel>Max Players</InputLabel>
                <Select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value as number)}
                >
                  {[2, 3, 4, 5, 6].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} Players
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Initial Cards</InputLabel>
                <Select
                  value={initialCards}
                  onChange={(e) => setInitialCards(e.target.value as number)}
                >
                  {[5, 6, 7, 8, 9, 10].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} Cards
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={allowBots}
                    onChange={(e) => setAllowBots(e.target.checked)}
                  />
                }
                label="Allow Bots"
              />

              {allowBots && (
                <FormControl fullWidth>
                  <InputLabel>Bot Difficulty</InputLabel>
                  <Select
                    value={botDifficulty}
                    onChange={(e) => setBotDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              )}
            </>
          )}

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => {
                setIsJoining(false);
                handleCreateGame();
              }}
              disabled={!username}
            >
              Create Game
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (isJoining) {
                  handleJoinGame();
                } else {
                  setIsJoining(true);
                }
              }}
              disabled={isJoining ? !username || !gameId : !username}
            >
              {isJoining ? 'Join Game' : 'Join Existing Game'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}; 