import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useGameStore } from '../store/gameStore';

export const ErrorSnackbar: React.FC = () => {
  const error = useGameStore((state) => state.error);
  const clearError = useGameStore((state) => state.clearError);

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={clearError}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={clearError} severity="error" variant="filled">
        {error}
      </Alert>
    </Snackbar>
  );
}; 