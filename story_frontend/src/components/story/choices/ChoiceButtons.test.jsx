import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChoiceButtons } from './ChoiceButtons';

describe('ChoiceButtons', () => {
  test('renders empty state when no choices provided', () => {
    render(<ChoiceButtons choices={[]} onChoose={jest.fn()} />);
    expect(screen.getByText(/No choices yet\. Generate to continue\./i)).toBeInTheDocument();
  });

  test('renders buttons for provided choices with vote counts when present', () => {
    const choices = [
      { id: '1', text: 'Go north', votes: 3 },
      { id: '2', text: 'Go south' }, // no votes
    ];
    render(<ChoiceButtons choices={choices} onChoose={jest.fn()} />);
    // Button texts and vote count formatting
    expect(screen.getByRole('button', { name: /choose: go north\. votes 3/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /choose: go south\. votes 0/i })).toBeInTheDocument();

    // Visible text content
    expect(screen.getByText(/Go north \(3\)/)).toBeInTheDocument();
    expect(screen.getByText('Go south')).toBeInTheDocument();
  });

  test('calls onChoose with selected choice id when a button is clicked', async () => {
    const user = userEvent.setup();
    const onChoose = jest.fn();
    const choices = [
      { id: 'a', text: 'Enter the cave', votes: 1 },
      { id: 'b', text: 'Climb the mountain', votes: 2 },
    ];
    render(<ChoiceButtons choices={choices} onChoose={onChoose} />);

    const caveBtn = screen.getByRole('button', { name: /choose: enter the cave\. votes 1/i });
    await user.click(caveBtn);

    expect(onChoose).toHaveBeenCalledTimes(1);
    expect(onChoose).toHaveBeenCalledWith('a');
  });
});
