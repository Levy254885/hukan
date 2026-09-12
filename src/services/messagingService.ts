/**
 * Property-related messaging only — not a public chat network.
 * Conversation is always tied to a property + agent.
 */

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'user' | 'agent';
  body: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userId: string;
  agentId: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadByUser: number;
  unreadByAgent: number;
  createdAt: string;
}

const CONV_KEY = 'hukan_conversations';
const MSG_KEY = 'hukan_messages';

function loadConvos(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CONV_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveConvos(c: Conversation[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONV_KEY, JSON.stringify(c));
}

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(MSG_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveMessages(m: Message[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MSG_KEY, JSON.stringify(m));
}

export async function getConversationsForUser(userId: string): Promise<Conversation[]> {
  return loadConvos()
    .filter((c) => c.userId === userId || c.agentId === userId)
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

export async function getConversation(id: string): Promise<Conversation | null> {
  return loadConvos().find((c) => c.id === id) ?? null;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return loadMessages()
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function startOrGetConversation(params: {
  userId: string;
  agentId: string;
  propertyId: string;
  propertyTitle: string;
  initialMessage?: string;
}): Promise<Conversation> {
  const existing = loadConvos().find(
    (c) =>
      c.userId === params.userId &&
      c.propertyId === params.propertyId &&
      c.agentId === params.agentId
  );
  if (existing) {
    if (params.initialMessage) {
      await sendMessage({
        conversationId: existing.id,
        senderId: params.userId,
        senderRole: 'user',
        body: params.initialMessage,
      });
      return (await getConversation(existing.id))!;
    }
    return existing;
  }

  const now = new Date().toISOString();
  const convo: Conversation = {
    id: `conv_${Date.now().toString(36)}`,
    propertyId: params.propertyId,
    propertyTitle: params.propertyTitle,
    userId: params.userId,
    agentId: params.agentId,
    lastMessageAt: now,
    lastMessagePreview: params.initialMessage || '',
    unreadByUser: 0,
    unreadByAgent: params.initialMessage ? 1 : 0,
    createdAt: now,
  };

  const convos = loadConvos();
  convos.push(convo);
  saveConvos(convos);

  if (params.initialMessage) {
    await sendMessage({
      conversationId: convo.id,
      senderId: params.userId,
      senderRole: 'user',
      body: params.initialMessage,
    });
  }

  return (await getConversation(convo.id))!;
}

export async function sendMessage(params: {
  conversationId: string;
  senderId: string;
  senderRole: 'user' | 'agent';
  body: string;
}): Promise<Message> {
  const body = params.body.trim();
  if (!body) throw new Error('Message cannot be empty');

  const msg: Message = {
    id: `msg_${Date.now().toString(36)}`,
    conversationId: params.conversationId,
    senderId: params.senderId,
    senderRole: params.senderRole,
    body,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const messages = loadMessages();
  messages.push(msg);
  saveMessages(messages);

  const convos = loadConvos();
  const idx = convos.findIndex((c) => c.id === params.conversationId);
  if (idx >= 0) {
    convos[idx] = {
      ...convos[idx],
      lastMessageAt: msg.createdAt,
      lastMessagePreview: body.slice(0, 120),
      unreadByAgent:
        params.senderRole === 'user'
          ? convos[idx].unreadByAgent + 1
          : convos[idx].unreadByAgent,
      unreadByUser:
        params.senderRole === 'agent'
          ? convos[idx].unreadByUser + 1
          : convos[idx].unreadByUser,
    };
    saveConvos(convos);
  }

  return msg;
}

export async function markConversationRead(
  conversationId: string,
  readerRole: 'user' | 'agent'
): Promise<void> {
  const convos = loadConvos();
  const idx = convos.findIndex((c) => c.id === conversationId);
  if (idx < 0) return;
  if (readerRole === 'user') convos[idx].unreadByUser = 0;
  else convos[idx].unreadByAgent = 0;
  saveConvos(convos);

  const messages = loadMessages().map((m) =>
    m.conversationId === conversationId && m.senderRole !== readerRole
      ? { ...m, read: true }
      : m
  );
  saveMessages(messages);
}
