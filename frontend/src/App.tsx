import React from 'react';
import { ShellLayout } from './layouts/ShellLayout';
import { HomePage } from './pages/HomePage';

export const App: React.FC = () => {
  return (
    <ShellLayout>
      <HomePage />
    </ShellLayout>
  );
};

export default App;
