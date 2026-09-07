import { cn } from '@/lib/cn';
import { Button } from '@/primitives/Button';

export type SuggestionChipsProps = {
  suggestions: readonly string[];
  onSelect: (prompt: string) => void;
  label?: string;
  className?: string;
};

export function SuggestionChips({
  suggestions,
  onSelect,
  label = 'Suggested prompts',
  className,
}: SuggestionChipsProps) {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onSelect(suggestion)}
          className="rounded-full transition-transform hover:-translate-y-px"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
