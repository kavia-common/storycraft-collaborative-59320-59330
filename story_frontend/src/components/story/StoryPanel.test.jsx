import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoryPanel } from './StoryPanel';

describe('StoryPanel', () => {
  test('renders story panel with title and default text when no text provided', () => {
    render(<StoryPanel text="" choices={[]} onChoose={jest.fn()} onNarrate={jest.fn()} />);

    // Title
    expect(screen.getByText('Story')).toBeInTheDocument();

    // Default placeholder text
    expect(screen.getByText(/Your adventure begins\.\.\./i)).toBeInTheDocument();

    // Narrate button with aria label
    const narrateBtn = screen.getByRole('button', { name: /Narrate this text/i });
    expect(narrateBtn).toBeInTheDocument();
    expect(narrateBtn).toHaveTextContent('Narrate');
  });

  test('renders provided story text', () => {
    render(<StoryPanel text="Once upon a time" choices={[]} onChoose={jest.fn()} onNarrate={jest.fn()} />);
    expect(screen.getByText('Once upon a time')).toBeInTheDocument();
  });

  test('invokes onNarrate when narrate button is clicked', async () => {
    const user = userEvent.setup();
    const onNarrate = jest.fn();
    render(<StoryPanel text="A tale" choices={[]} onChoose={jest.fn()} onNarrate={onNarrate} />);

    await user.click(screen.getByRole('button', { name: /Narrate this text/i }));
    expect(onNarrate).toHaveBeenCalledTimes(1);
  });

  test('passes choices and triggers onChoose via ChoiceButtons', async () => {
    const user = userEvent.setup();
    const onChoose = jest.fn();
    const choices = [
      { id: 'go', text: 'Go forward', votes: 5 },
      { id: 'back', text: 'Turn back', votes: 1 },
    ];

    render(<StoryPanel text="At the crossroads" choices={choices} onChoose={onChoose} onNarrate={jest.fn()} />);

    // Ensure choice buttons are present via their aria-labels
    const goBtn = screen.getByRole('button', { name: /choose: go forward\. votes 5/i });
    const backBtn = screen.getByRole('button', { name: /choose: turn back\. votes 1/i });
    expect(goBtn).toBeInTheDocument();
    expect(backBtn).toBeInTheDocument();

    await user.click(goBtn);
    expect(onChoose).toHaveBeenCalledTimes(1);
    expect(onChoose).toHaveBeenCalledWith('go');
  });
});
