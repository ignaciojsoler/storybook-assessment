import { Info, RotateCcw } from 'lucide-react';
import { Button } from '@/primitives/Button';
import { Text } from '@/primitives/Text';
import { CitationList } from './CitationList';
import type { Citation, Message } from './types';

export type AssistantMessageProps = {
  message: Message;
  onRetry?: (messageId: string) => void;
  onCitationClick?: (citation: Citation) => void;
};

export function AssistantMessage({
  message,
  onRetry,
  onCitationClick,
}: AssistantMessageProps) {
  const isUser = message.role === 'user';
  const roleLabel = isUser ? 'User' : 'Assistant';
  const isStreaming = message.status === 'streaming';
  const isError = message.status === 'error';

  if (isUser) {
    return (
      <article aria-label="User message" className="flex justify-end">
        <div className="min-w-0 max-w-[85%]">
          <p aria-hidden="true" className="mb-1 text-right text-xs font-semibold tracking-wide text-text-tertiary uppercase">
            You
          </p>
          <div className="rounded-[var(--radius-md)] bg-bg-subtle px-3 py-2">
            <Text className="break-words whitespace-pre-wrap">{message.content}</Text>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      aria-label="Assistant message"
      aria-busy={isStreaming || undefined}
    >
      <div className="min-w-0 flex-1">
        <p aria-hidden="true" className="mb-1 text-xs font-semibold tracking-wide text-text-tertiary uppercase">
          {roleLabel}
        </p>
        <div aria-live="off">
          <Text className="break-words whitespace-pre-wrap">
            {message.content}
            {isStreaming && (
              <span aria-hidden="true" className="ml-0.5 inline-block animate-pulse text-text-tertiary">
                ▍
              </span>
            )}
          </Text>
        </div>

        {!isStreaming && message.citations && message.citations.length > 0 && (
          <CitationList
            citations={message.citations}
            onClick={onCitationClick ?? (() => {})}
          />
        )}

        {isError && (
          <div
            role="alert"
            className="mt-2 flex items-center gap-2 rounded-[var(--radius-md)] border border-danger/20 bg-danger-surface px-3 py-2"
          >
            <Info size={16} aria-hidden="true" className="shrink-0 text-danger" />
            <Text className="flex-1 text-xs text-danger">
              This turn failed. Nothing was saved.
            </Text>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onRetry?.(message.id)}
              aria-label="Retry message"
              className="shrink-0"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Retry
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
