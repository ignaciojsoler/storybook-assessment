import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Composer } from './Composer';

const noop = () => {};

const meta = {
  title: 'Assistant/Composer',
  component: Composer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Message input. Enter sends, Shift+Enter adds a line. While streaming it swaps Send for Stop and blocks submit.',
      },
    },
  },
  argTypes: {
    status: { control: 'select', options: ['idle', 'streaming', 'error'] },
  },
} satisfies Meta<typeof Composer>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(args: React.ComponentProps<typeof Composer>) {
  const [value, setValue] = useState(args.value ?? '');
  return <Composer {...args} value={value} onValueChange={setValue} />;
}

export const Idle: Story = {
  args: { value: '', status: 'idle', onSubmit: noop, onStop: noop, onValueChange: noop },
  parameters: { docs: { description: { story: 'Ready to send. Send enables once there is text.' } } },
  render: (args) => <Controlled {...args} />,
};

export const WithText: Story = {
  args: { value: 'Which scores support the finding?', status: 'idle', onSubmit: noop, onStop: noop, onValueChange: noop },
  parameters: { docs: { description: { story: 'Draft in progress; Enter or Send submits.' } } },
  render: (args) => <Controlled {...args} />,
};

export const Streaming: Story = {
  args: { value: '', status: 'streaming', onSubmit: noop, onStop: noop, onValueChange: noop },
  parameters: { docs: { description: { story: 'Generation in flight: Stop shown, submit blocked.' } } },
  render: (args) => <Controlled {...args} />,
};
