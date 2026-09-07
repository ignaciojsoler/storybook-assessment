import { useEffect, useRef } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { IconButton } from '@/primitives/IconButton';
import { Text } from '@/primitives/Text';
import { Textarea } from '@/primitives/Textarea';
import type { AssistantStatus } from './types';

export type ComposerProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  status: AssistantStatus;
  placeholder?: string;
  disabled?: boolean;
};

/** Single-line bar that grows with the text, like mainstream chat inputs. */
const MAX_BAR_HEIGHT_PX = 160;

export function Composer({
  value,
  onValueChange,
  onSubmit,
  onStop,
  status,
  placeholder = 'Ask about the report…',
  disabled = false,
}: ComposerProps) {
  const isStreaming = status === 'streaming';
  const canSend = !isStreaming && !disabled && value.trim().length > 0;
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = 'auto';
    area.style.height = `${Math.min(area.scrollHeight, MAX_BAR_HEIGHT_PX)}px`;
  }, [value]);

  const handleSubmit = () => {
    if (isStreaming || disabled) return;
    if (value.trim().length === 0) return;
    onSubmit();
  };

  return (
    <form
      aria-label="Assistant composer"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div className="flex items-end gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface px-3 py-2 focus-within:ring-2 focus-within:ring-focus">
        <Textarea
          ref={areaRef}
          aria-label="Ask the assistant"
          placeholder={placeholder}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          className="max-h-40 resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
        />
        {isStreaming ? (
          <IconButton
            onClick={onStop}
            aria-label="Stop generating"
            className="mb-0.5 size-9 shrink-0 bg-accent text-text-inverse transition-colors hover:bg-accent-hover"
          >
            <Square size={14} aria-hidden="true" />
          </IconButton>
        ) : (
          <IconButton
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className="mb-0.5 size-9 shrink-0 bg-accent text-text-inverse transition-colors hover:bg-accent-hover"
          >
            <ArrowUp size={16} aria-hidden="true" />
          </IconButton>
        )}
      </div>
      <Text tone="tertiary" as="p" className="mt-2 px-1 text-xs">
        Enter to send, Shift+Enter for a new line
      </Text>
    </form>
  );
}
