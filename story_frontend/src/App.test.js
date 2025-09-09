import { render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './state/AppProviders';

test('renders app shell', () => {
  render(
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  );
  expect(screen.getByRole('banner')).toBeInTheDocument();
});
