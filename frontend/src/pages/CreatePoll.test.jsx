import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreatePoll from './CreatePoll';

vi.mock('../api', () => ({
  createPoll: vi.fn(),
}));

function renderCreatePoll() {
  return render(
    <BrowserRouter>
      <CreatePoll />
    </BrowserRouter>
  );
}

describe('CreatePoll', () => {
  it('renders the create poll heading', () => {
    renderCreatePoll();
    expect(screen.getByRole('heading', { name: /create a poll/i })).toBeInTheDocument();
  });

  it('renders question input', () => {
    renderCreatePoll();
    expect(screen.getByPlaceholderText(/what would you like to ask/i)).toBeInTheDocument();
  });

  it('renders at least 2 option inputs', () => {
    renderCreatePoll();
    expect(screen.getByPlaceholderText('Option 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Option 2')).toBeInTheDocument();
  });

  it('shows error when submitting without question', async () => {
    renderCreatePoll();
    fireEvent.click(screen.getByRole('button', { name: /create poll/i }));
    expect(await screen.findByText(/please enter a question/i)).toBeInTheDocument();
  });

  it('shows error when only one option is filled', async () => {
    renderCreatePoll();
    fireEvent.change(screen.getByPlaceholderText(/what would you like to ask/i), {
      target: { value: 'Test question?' },
    });
    fireEvent.change(screen.getByPlaceholderText('Option 1'), { target: { value: 'Only one' } });
    fireEvent.click(screen.getByRole('button', { name: /create poll/i }));
    expect(await screen.findByText(/please add at least 2 options/i)).toBeInTheDocument();
  });

  it('has Add option button', () => {
    renderCreatePoll();
    expect(screen.getByRole('button', { name: /add option/i })).toBeInTheDocument();
  });
});
