import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Heading } from '@/primitives/Heading';
import { IconButton } from '@/primitives/IconButton';
import { Text } from '@/primitives/Text';
import { sampleSuggestions } from '@/fixtures';
import { AssistantMessage } from './AssistantMessage';
import { Composer } from './Composer';
import { EmptyState } from './EmptyState';
import type { AssistantStatus, Citation, Message } from './types';

export type AssistantPanelProps = {
  messages: Message[];
  status: AssistantStatus;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  onRetry: (messageId: string) => void;
  onSuggestionSelect: (prompt: string) => void;
  onCitationClick: (citation: Citation) => void;
  suggestions?: readonly string[];
  title?: string;
  notice?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Optional: when provided, a close button renders top-right. */
  onClose?: () => void;
};

const statusText = {
  idle: 'Ready',
  streaming: 'Generating…',
  error: 'Needs attention',
} as const;

export function AssistantPanel({
  messages,
  status,
  value,
  onValueChange,
  onSubmit,
  onStop,
  onRetry,
  onSuggestionSelect,
  onCitationClick,
  suggestions = sampleSuggestions,
  title = 'Assistant',
  notice = 'Sample data only',
  emptyTitle,
  emptyDescription,
  onClose,
}: AssistantPanelProps) {
  const isEmpty = messages.length === 0;
  const threadRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages[messages.length - 1];
  const didMountRef = useRef(false);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    if (!didMountRef.current) {
      // First paint lands at the bottom without animating.
      didMountRef.current = true;
      thread.scrollTop = thread.scrollHeight;
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    thread.scrollTo({
      top: thread.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [messages.length, lastMessage?.content]);

  return (
    <section
      aria-label="Assistant panel"
      className="flex h-[100dvh] w-full max-w-[420px] flex-col overflow-hidden rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface"
    >
      <header className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
        <div className="min-w-0 flex-1">
          <Heading as="h2" className="text-base">
            {title}
          </Heading>
          <Text tone="secondary" as="span" className="text-xs">
            <span role="status">{statusText[status]}</span>
            {notice ? ` · ${notice}` : null}
          </Text>
        </div>
        {onClose && (
          <IconButton
            onClick={onClose}
            aria-label="Close assistant panel"
            className="shrink-0"
          >
            <X size={16} aria-hidden="true" />
          </IconButton>
        )}
      </header>

      <div
        ref={threadRef}
        role="log"
        aria-label="Conversation history"
        aria-live="polite"
        tabIndex={0}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset"
      >
        {isEmpty ? (
          <EmptyState
            suggestions={suggestions}
            onSelect={onSuggestionSelect}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          messages.map((message) => (
            <AssistantMessage
              key={message.id}
              message={message}
              onRetry={onRetry}
              onCitationClick={onCitationClick}
            />
          ))
        )}
      </div>

      <div className="border-t border-border-subtle p-3">
        <Composer
          value={value}
          onValueChange={onValueChange}
          onSubmit={onSubmit}
          onStop={onStop}
          status={status}
        />
      </div>
    </section>
  );
}
