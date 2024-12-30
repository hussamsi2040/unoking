import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage, GamePage, NotFoundPage } from './pages';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ErrorSnackbar } from './components/ErrorSnackbar';
import { useGameStore } from './store/gameStore';

export const App: React.FC = () => {
  const isLoading = useGameStore((state) => state.isLoading);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <LoadingOverlay isOpen={isLoading} message="Loading..." />
      <ErrorSnackbar />
    </>
  );
}; 