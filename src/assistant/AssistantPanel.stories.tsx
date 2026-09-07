import type { Meta, StoryObj } from '@storybook/react-vite';
import { denseThread, errorMessage, sampleMessages } from '@/fixtures';
import { AssistantPanel } from './AssistantPanel';
import type { AssistantPanelProps } from './AssistantPanel';
import type { Message } from './types';
import { useSimulatedThread, type SimulatedThreadOptions } from './useSimulatedThread';

const meta = {
  title: 'Assistant/Panel',
  component: AssistantPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Clinical assistant shell: header + scrollable thread + composer. Fully controlled — stories own state with `useSimulatedThread` (a `useFakeStream` wrapper) and no backend. No backend: every story below simulates the full send → stream → stop/retry loop locally.',
      },
    },
  },
  argTypes: {
    intervalMs: { control: { type: 'number', min: 5, max: 200, step: 5 } },
  } as Meta<typeof AssistantPanel>['argTypes'],
} satisfies Meta<typeof AssistantPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs: AssistantPanelProps = {
  messages: [],
  status: 'idle',
  value: '',
  onValueChange: () => {},
  onSubmit: () => {},
  onStop: () => {},
  onRetry: () => {},
  onSuggestionSelect: () => {},
  onCitationClick: () => {},
  title: 'Assistant',
  notice: 'Sample data only',
  emptyTitle: 'Ask about this report',
  emptyDescription: 'Clarify a finding or request a rewrite. Sample data only — no real patient info.',
};

function readIntervalMs(args: Story['args']) {
  return (args as unknown as { intervalMs?: number }).intervalMs ?? 30;
}

/** One wiring of hook → panel shared by every story; stories only pass options. */
function SimulatedPanel({
  storyArgs,
  intervalMs,
  options,
  hideCitations = false,
}: {
  storyArgs: Story['args'];
  intervalMs: number;
  options: Omit<SimulatedThreadOptions, 'intervalMs'>;
  hideCitations?: boolean;
}) {
  const sim = useSimulatedThread({ ...options, intervalMs });
  const messages: Message[] = hideCitations
    ? sim.messages.map(({ citations: _dropped, ...rest }) => rest)
    : sim.messages;
  return (
    <AssistantPanel
      messages={messages}
      status={sim.status}
      value={sim.value}
      onValueChange={sim.setValue}
      onSubmit={() => {
        sim.submit();
        storyArgs?.onSubmit?.();
      }}
      onStop={() => {
        sim.stopStream();
        storyArgs?.onStop?.();
      }}
      onRetry={(id) => {
        sim.retry(id);
        storyArgs?.onRetry?.(id);
      }}
      onSuggestionSelect={(prompt) => {
        sim.submitText(prompt);
        storyArgs?.onSuggestionSelect?.(prompt);
      }}
      onCitationClick={(c) => storyArgs?.onCitationClick?.(c)}
      onClose={() => {
        storyArgs?.onClose?.();
      }}
      title={storyArgs?.title}
      notice={storyArgs?.notice}
      emptyTitle={storyArgs?.emptyTitle}
      emptyDescription={storyArgs?.emptyDescription}
    />
  );
}

export const Empty: Story = {
  args: { ...baseArgs, intervalMs: 30 } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          'When to use: first open, no history yet. Try it: pick a chip or type and send — a simulated answer streams back. No backend involved.',
      },
    },
  },
  render: (args) => (
    <SimulatedPanel storyArgs={args} intervalMs={readIntervalMs(args)} options={{ initialMessages: [] }} />
  ),
};

export const Streaming: Story = {
  args: { ...baseArgs, intervalMs: 30 } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          'When to use: answer arriving token by token. Auto-plays on mount; press Stop to freeze it, then send a follow-up to see the loop again.',
      },
    },
  },
  render: (args) => (
    <SimulatedPanel
      storyArgs={args}
      intervalMs={readIntervalMs(args)}
      options={{
        initialMessages: [sampleMessages[0]],
        initialStatus: 'streaming',
        autoStart: true,
      }}
    />
  ),
};

export const Error: Story = {
  args: { ...baseArgs, intervalMs: 30 } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          'When to use: a turn failed. Press Retry to watch the simulated recovery stream in; the composer stays usable so you can rephrase instead.',
      },
    },
  },
  render: (args) => (
    <SimulatedPanel
      storyArgs={args}
      intervalMs={readIntervalMs(args)}
      options={{
        initialMessages: [...sampleMessages, errorMessage],
        initialStatus: 'error',
      }}
    />
  ),
};

export const WithCitations: Story = {
  args: { ...baseArgs, showCitations: true, intervalMs: 30 } as Story['args'],
  argTypes: {
    showCitations: { control: 'boolean' },
  } as Story['argTypes'],
  parameters: {
    docs: {
      description: {
        story:
          'When to use: answer grounded in sources. Toggle citations to compare density, click a source, or send a message — replies carry sources too.',
      },
    },
  },
  render: (args) => {
    const show = (args as unknown as { showCitations?: boolean }).showCitations ?? true;
    return (
      <SimulatedPanel
        storyArgs={args}
        intervalMs={readIntervalMs(args)}
        options={{
          initialMessages: sampleMessages,
          replyCitations: sampleMessages[1].citations,
        }}
        hideCitations={!show}
      />
    );
  },
};

export const DenseThread: Story = {
  args: { ...baseArgs, messageCount: 10, intervalMs: 30 } as Story['args'],
  argTypes: {
    messageCount: { control: { type: 'number', min: 8, max: 12, step: 1 } },
  } as Story['argTypes'],
  parameters: {
    docs: {
      description: {
        story:
          'When to use: long case thread (8–12 turns). Send a message to watch it append and auto-scroll while header and composer stay pinned.',
      },
    },
  },
  render: (args) => {
    const extra = args as unknown as { messageCount?: number };
    const count = Math.min(12, Math.max(8, extra.messageCount ?? 10));
    return (
      <SimulatedPanel
        key={count}
        storyArgs={args}
        intervalMs={readIntervalMs(args)}
        options={{ initialMessages: buildDenseThread(count) }}
      />
    );
  },
};

/** Extends the 10-turn fixture in its own style so the density control reaches 12. */
function buildDenseThread(count: number): Message[] {
  return Array.from({ length: count }, (_, index) => {
    if (index < denseThread.length) return denseThread[index];
    const isUser = index % 2 === 0;
    return {
      id: `dense-${index + 1}`,
      role: isUser ? 'user' : 'assistant',
      content: isUser
        ? `Sample question ${index / 2 + 1} about the report.`
        : `Sample answer ${Math.ceil(index / 2)} — not a real clinical opinion.`,
      status: 'done' as const,
    };
  });
}
