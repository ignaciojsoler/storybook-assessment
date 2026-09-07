import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { denseThread, sampleMessages } from '@/fixtures';
import { AssistantPanel } from './AssistantPanel';
import type { AssistantPanelProps } from './AssistantPanel';

function baseProps(overrides: Partial<AssistantPanelProps> = {}): AssistantPanelProps {
  return {
    messages: [],
    status: 'idle',
    value: '',
    onValueChange: () => {},
    onSubmit: () => {},
    onStop: () => {},
    onRetry: () => {},
    onSuggestionSelect: () => {},
    onCitationClick: () => {},
    ...overrides,
  };
}

describe('AssistantPanel', () => {
  it('renders the empty state with suggestion chips when there are no messages', () => {
    render(<AssistantPanel {...baseProps()} />);
    expect(screen.getByText('Ask about this report')).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Suggested prompts' }),
    ).toBeInTheDocument();
  });

  it('renders the thread instead of the empty state when messages exist', () => {
    render(<AssistantPanel {...baseProps({ messages: sampleMessages })} />);
    expect(screen.queryByText('Ask about this report')).not.toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'User message' })).toBeInTheDocument();
    expect(
      screen.getByRole('article', { name: 'Assistant message' }),
    ).toBeInTheDocument();
  });

  it('reflects status in the header and swaps send for stop while streaming', () => {
    const { rerender } = render(
      <AssistantPanel {...baseProps({ messages: denseThread })} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Ready');
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();

    rerender(<AssistantPanel {...baseProps({ messages: denseThread, status: 'streaming' })} />);
    expect(screen.getByRole('status')).toHaveTextContent('Generating…');
    expect(
      screen.getByRole('button', { name: 'Stop generating' }),
    ).toBeInTheDocument();
  });

  it('only shows a close button when onClose is provided, and calls it', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AssistantPanel {...baseProps()} />);
    expect(
      screen.queryByRole('button', { name: 'Close assistant panel' }),
    ).not.toBeInTheDocument();

    const onClose = vi.fn();
    rerender(<AssistantPanel {...baseProps({ onClose })} />);
    await user.click(screen.getByRole('button', { name: 'Close assistant panel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
