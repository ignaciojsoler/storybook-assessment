import { Bookmark, FileText, StickyNote } from 'lucide-react';
import type { Citation } from './types';

export type CitationListProps = {
  citations: Citation[];
  onClick: (citation: Citation) => void;
};

const kindIcon = {
  document: FileText,
  section: Bookmark,
  note: StickyNote,
} as const;

export function CitationList({ citations, onClick }: CitationListProps) {
  if (citations.length === 0) return null;
  return (
    <div className="mt-2">
      <p className="mb-1 text-xs font-semibold tracking-wide text-text-tertiary uppercase">
        Sources
      </p>
      <ul className="flex flex-wrap gap-1.5" aria-label="Cited sources">
        {citations.map((citation) => {
          const Icon = kindIcon[citation.kind];
          return (
            <li key={citation.id} className="max-w-full">
              <button
                type="button"
                onClick={() => onClick(citation)}
                aria-label={`Source, ${citation.kind}: ${citation.title}`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border-subtle bg-bg-page py-1 pr-3 pl-2 text-xs text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <Icon size={14} aria-hidden="true" className="shrink-0" />
                <span className="max-w-[200px] truncate">{citation.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
