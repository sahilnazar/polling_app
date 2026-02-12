import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

function renderHome() {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
}

describe('Home', () => {
  it('renders the app title', () => {
    renderHome();
    expect(screen.getByRole('heading', { name: /polling app/i })).toBeInTheDocument();
  });

  it('renders Create a poll link', () => {
    renderHome();
    expect(screen.getByRole('link', { name: /create a poll/i })).toBeInTheDocument();
  });

  it('renders Browse polls link', () => {
    renderHome();
    expect(screen.getByRole('link', { name: /browse polls/i })).toBeInTheDocument();
  });

  it('Create a poll link goes to /create', () => {
    renderHome();
    const link = screen.getByRole('link', { name: /create a poll/i });
    expect(link).toHaveAttribute('href', '/create');
  });

  it('Browse polls link goes to /polls', () => {
    renderHome();
    const link = screen.getByRole('link', { name: /browse polls/i });
    expect(link).toHaveAttribute('href', '/polls');
  });
});
