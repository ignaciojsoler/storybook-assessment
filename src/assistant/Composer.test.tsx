import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Composer } from './Composer';

function ControlledComposer({
  initialValue = '',
  status = 'idle',
  onSubmit = () => {},
  onStop = () => {},
}: {
  initialValue?: string;
  status?: 'idle' | 'streaming' | 'error';
  onSubmit?: () => void;
  onStop?: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <Composer
      value={value}
      onValueChange={setValue}
      onSubmit={onSubmit}
      onStop={onStop}
      status={status}
    />
  );
}

describe('Composer', () => {
  it('submits via click when there is text', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ControlledComposer initialValue="Which scores support the finding?" onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('submits via Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ControlledComposer initialValue="Rewrite the history" onSubmit={onSubmit} />);

    await user.click(screen.getByRole('textbox', { name: 'Ask the assistant' }));
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('while streaming shows stop and does not submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    render(
      <ControlledComposer initialValue="Draft text" status="streaming" onSubmit={onSubmit} onStop={onStop} />,
    );

    expect(screen.getByRole('button', { name: 'Stop generating' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send message' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('textbox', { name: 'Ask the assistant' }));
    await user.keyboard('{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Stop generating' }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
