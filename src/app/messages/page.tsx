'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getConversationsForUser,
  getMessages,
  sendMessage,
  markConversationRead,
  type Conversation,
  type Message,
} from '@/services/messagingService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/signin');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getConversationsForUser(user.id).then((c) => {
      setConversations(c);
      if (c.length && !activeId) setActiveId(c[0].id);
    });
  }, [user]);

  useEffect(() => {
    if (!activeId || !user) return;
    getMessages(activeId).then(setMessages);
    const role =
      conversations.find((c) => c.id === activeId)?.agentId === user.id
        ? 'agent'
        : 'user';
    markConversationRead(activeId, role);
  }, [activeId, user, conversations]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !activeId || !body.trim()) return;
    setSending(true);
    try {
      const role =
        conversations.find((c) => c.id === activeId)?.agentId === user.id
          ? 'agent'
          : 'user';
      await sendMessage({
        conversationId: activeId,
        senderId: user.id,
        senderRole: role,
        body,
      });
      setBody('');
      setMessages(await getMessages(activeId));
      setConversations(await getConversationsForUser(user.id));
    } finally {
      setSending(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">Messages</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Property-related conversations only — started from a listing enquiry.
      </p>

      {conversations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="font-medium">No conversations yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Send an enquiry from a property page to start a thread with the agent.
          </p>
        </div>
      ) : (
        <div className="grid h-[60vh] overflow-hidden rounded-lg border border-border lg:grid-cols-[280px_1fr]">
          <aside className="overflow-y-auto border-b border-border lg:border-b-0 lg:border-r">
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={cn(
                  'w-full border-b border-border px-4 py-3 text-left text-sm hover:bg-muted/50',
                  activeId === c.id && 'bg-muted'
                )}
              >
                <p className="truncate font-medium">{c.propertyTitle}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.lastMessagePreview || 'No messages'}
                </p>
              </button>
            ))}
          </aside>
          <div className="flex flex-col">
            {active ? (
              <>
                <div className="border-b border-border px-4 py-3">
                  <p className="font-medium">{active.propertyTitle}</p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                        m.senderId === user.id
                          ? 'ml-auto bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {m.body}
                      <p
                        className={cn(
                          'mt-1 text-[10px]',
                          m.senderId === user.id
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        )}
                      >
                        {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
                  <input
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type a message…"
                    className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button type="submit" disabled={sending || !body.trim()}>
                    Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
