import type { Meta, StoryObj } from '@storybook/react-vite';
import { errorMessage, sampleMessages } from '@/fixtures';
import { AssistantMessage } from './AssistantMessage';

const noop = () => {};

const meta = {
  title: 'Assistant/Message',
  component: AssistantMessage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One conversation turn. User renders as a right-aligned bubble; assistant as a left row with sources, streaming, or retry states.',
      },
    },
  },
} satisfies Meta<typeof AssistantMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const User: Story = {
  args: { message: sampleMessages[0] },
  parameters: {
    docs: { description: { story: 'Clinician turn. Exposed as “User message” to assistive tech.' } },
  },
};

export const Assistant: Story = {
  args: { message: sampleMessages[1], onCitationClick: noop },
  parameters: {
    docs: { description: { story: 'Assistant answer with clickable cited sources.' } },
  },
};

export const Streaming: Story = {
  args: {
    message: { ...sampleMessages[1], id: 'msg-stream', content: 'Working memory and CPT…', status: 'streaming' as const },
  },
  parameters: {
    docs: { description: { story: 'Partial answer while tokens arrive. Marked busy, not re-announced per token.' } },
  },
};

export const Failed: Story = {
  args: { message: errorMessage, onRetry: noop },
  parameters: {
    docs: { description: { story: 'Failed turn with an alert + Retry action.' } },
  },
};
