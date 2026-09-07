import { useCallback, useEffect, useRef, useState } from 'react';
import { sampleMessages, useFakeStream } from '@/fixtures';
import type { AssistantStatus, Citation, Message } from './types';

export type SimulatedThreadOptions = {
  initialMessages: Message[];
  initialStatus?: AssistantStatus;
  replyText?: string;
  replyCitations?: Citation[];
  intervalMs?: number;
  autoStart?: boolean;
};

/**
 * Story-only stand-in for a backend: appends the user's text, then streams a
 * canned PHI-safe reply via `useFakeStream`. Powers submit / stop / retry /
 * suggestion chips in `Assistant/Panel/*` stories. Not exported from the
 * package surface (`index.ts`).
 */
export function useSimulatedThread({
  initialMessages,
  initialStatus = 'idle',
  replyText = sampleMessages[1].content,
  replyCitations,
  intervalMs = 30,
  autoStart = false,
}: SimulatedThreadOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<AssistantStatus>(initialStatus);
  const replyIdRef = useRef<string | null>(null);
  const autoStartedRef = useRef(false);
  const { content, status: streamStatus, start, stop } = useFakeStream({
    text: replyText,
    intervalMs,
  });

  const beginReply = useCallback(
    (citations?: Citation[]) => {
      const id = `asst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      replyIdRef.current = id;
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: 'assistant',
          content: '',
          status: 'streaming',
          ...(citations && citations.length > 0 ? { citations } : {}),
        },
      ]);
      setStatus('streaming');
      start();
    },
    [start],
  );

  // Sync streamed tokens into the pending reply.
  useEffect(() => {
    const id = replyIdRef.current;
    if (!id) return;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content } : m)));
  }, [content]);

  // Mark the reply done once the fake stream finishes.
  useEffect(() => {
    if (streamStatus === 'done' && replyIdRef.current) {
      const id = replyIdRef.current;
      replyIdRef.current = null;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'done' as const } : m)),
      );
      setStatus('idle');
    }
  }, [streamStatus, content]);

  useEffect(() => {
    if (autoStart && !autoStartedRef.current) {
      autoStartedRef.current = true;
      beginReply(replyCitations);
    }
  }, [autoStart, beginReply, replyCitations]);

  const submitText = useCallback(
    (text: string) => {
      if (status === 'streaming' || text.trim() === '') return;
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'user',
          content: text,
          status: 'done',
        },
      ]);
      setValue('');
      beginReply(replyCitations);
    },
    [status, beginReply, replyCitations],
  );

  const submit = useCallback(() => submitText(value), [submitText, value]);

  const stopStream = useCallback(() => {
    stop();
    const id = replyIdRef.current;
    replyIdRef.current = null;
    if (id) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'done' as const } : m)),
      );
    }
    setStatus('idle');
  }, [stop]);

  const retry = useCallback(
    (id: string) => {
      if (status === 'streaming') return;
      replyIdRef.current = id;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, content: '', status: 'streaming' as const } : m,
        ),
      );
      setStatus('streaming');
      start();
    },
    [status, start],
  );

  return { messages, value, setValue, status, submit, submitText, stopStream, retry };
}
