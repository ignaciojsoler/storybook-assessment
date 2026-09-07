import type { Meta, StoryObj } from '@storybook/react-vite';
import { sampleSuggestions } from '@/fixtures';
import { SuggestionChips } from './SuggestionChips';

const noop = () => {};

const meta = {
  title: 'Assistant/SuggestionChips',
  component: SuggestionChips,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Empty-state entry points. Each chip is a real button; selecting one submits that prompt.',
      },
    },
  },
} satisfies Meta<typeof SuggestionChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { suggestions: [...sampleSuggestions], onSelect: noop },
  parameters: {
    docs: { description: { story: 'Three starter prompts for a fresh thread.' } },
  },
};

export const Single: Story = {
  args: { suggestions: [sampleSuggestions[0]], onSelect: noop },
  parameters: {
    docs: { description: { story: 'Degenerate case: one suggestion still wraps cleanly.' } },
  },
};
