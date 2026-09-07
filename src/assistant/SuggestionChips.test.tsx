import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sampleSuggestions } from '@/fixtures';
import { SuggestionChips } from './SuggestionChips';

describe('SuggestionChips', () => {
  it('activating a chip calls onSelect with that prompt', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SuggestionChips suggestions={sampleSuggestions} onSelect={onSelect} />);

    await user.click(
      screen.getByRole('button', { name: 'Which scores support the attention finding?' }),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('Which scores support the attention finding?');
  });
});
