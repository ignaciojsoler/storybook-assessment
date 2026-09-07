import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { errorMessage, sampleMessages } from '@/fixtures';
import { AssistantMessage } from './AssistantMessage';

describe('AssistantMessage', () => {
  it('retry calls onRetry with the failed message id', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<AssistantMessage message={errorMessage} onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: 'Retry message' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith('msg-error');
  });

  it('exposes user vs assistant role to assistive tech', () => {
    const { rerender } = render(<AssistantMessage message={sampleMessages[0]} />);
    expect(screen.getByRole('article', { name: 'User message' })).toBeInTheDocument();

    rerender(<AssistantMessage message={sampleMessages[1]} />);
    expect(screen.getByRole('article', { name: 'Assistant message' })).toBeInTheDocument();
  });
});
