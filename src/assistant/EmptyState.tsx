import { Sparkles } from 'lucide-react';
import { Heading } from '@/primitives/Heading';
import { Text } from '@/primitives/Text';
import { SuggestionChips } from './SuggestionChips';

export type EmptyStateProps = {
  suggestions: readonly string[];
  onSelect: (prompt: string) => void;
  title?: string;
  description?: string;
};

/** First open: what the assistant can do, then chips that submit directly. */
export function EmptyState({
  suggestions,
  onSelect,
  title = 'Ask about this report',
  description = 'Clarify a finding or request a rewrite. Sample data only — no real patient info.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <span
        aria-hidden="true"
        className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-sage-surface text-sage"
      >
        <Sparkles size={22} />
      </span>
      <Heading as="h3" className="mb-1">
        {title}
      </Heading>
      <Text tone="secondary" className="mb-5 max-w-[280px] text-xs">
        {description}
      </Text>
      <SuggestionChips suggestions={suggestions} onSelect={onSelect} className="justify-center" />
    </div>
  );
}
