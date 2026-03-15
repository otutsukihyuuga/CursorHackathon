'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Chat, Message } from '@/lib/types';

const STORAGE_KEY = 'echovoice-chats';

/** Strip audio from messages - keep only transcript as text. Reduces localStorage size. */
function migrateMessages(messages: Array<Message & { transcript?: string }>): Message[] {
  return messages.map((m) => {
    if (m.type === 'audio') {
      const { transcript, ...rest } = m;
      return { ...rest, type: 'text' as const, content: transcript ?? '[Audio message]' };
    }
    const { transcript: _t, ...rest } = m;
    return rest as Message;
  });
}

function loadChats(): Chat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const chats = JSON.parse(raw);
    return chats.map((c: Chat) => ({
      ...c,
      messages: migrateMessages(c.messages ?? []),
      referenceAudioDataUrl: undefined,
      referenceAudioBlob: undefined,
      clonedVoiceId: c.clonedVoiceId,
      clonedVoiceName: c.clonedVoiceName,
    }));
  } catch {
    return [];
  }
}

/** Chats to persist - no audio blobs or base64. */
function chatsForStorage(chats: Chat[]): unknown[] {
  return chats.map((c) => ({
    ...c,
    referenceAudioDataUrl: undefined,
    referenceAudioBlob: undefined,
    clonedVoiceId: c.clonedVoiceId,
    clonedVoiceName: c.clonedVoiceName,
    messages: c.messages.map((m) => ({ id: m.id, role: m.role, type: m.type, content: m.content, timestamp: m.timestamp })),
  }));
}

function saveChats(chats: Chat[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatsForStorage(chats)));
  } catch {
    // ignore
  }
}

function isEmptyChat(c: Chat): boolean {
  return !c.referenceAudioDataUrl && c.messages.length === 0;
}

interface ChatContextValue {
  chats: Chat[];
  selectedChatId: string | null;
  selectChat: (id: string | null) => void;
  /** Incremented when the message input should be focused (e.g. after New Chat). */
  focusMessageInputTrigger: number;
  /** Request focus on the message input (e.g. after clicking New Chat). */
  requestFocusMessageInput: () => void;
  /** Create a new empty chat (ChatGPT-style). Reuses existing empty chat to prevent spam. */
  createEmptyChat: () => Chat;
  /** Create chat with reference audio, or add audio to an existing empty chat. */
  createChat: (referenceAudioBlob: Blob, filename?: string) => Promise<Chat>;
  addReferenceAudio: (chatId: string, blob: Blob, filename?: string) => Promise<void>;
  /** Set the chat's reference to a cloned voice (from /users/{id}/cloned-voices). */
  setClonedVoice: (chatId: string, voiceId: string | number, voiceName?: string) => void;
  addMessage: (
    chatId: string,
    message: {
      role: Message['role'];
      type: Message['type'];
      content: string;
    },
    options?: { userId: string; clonedVoiceName?: string; token?: string | null }
  ) => Promise<void>;
  deleteChat: (id: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [focusMessageInputTrigger, setFocusMessageInputTrigger] = useState(0);

  const requestFocusMessageInput = useCallback(() => {
    setFocusMessageInputTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    setChats(loadChats());
  }, []);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  const selectChat = useCallback((id: string | null) => {
    setSelectedChatId(id);
  }, []);

  const createEmptyChat = useCallback((): Chat => {
    const existingEmpty = chats.find(isEmptyChat);
    if (existingEmpty) {
      setSelectedChatId(existingEmpty.id);
      setFocusMessageInputTrigger((n) => n + 1);
      return existingEmpty;
    }
    const chat: Chat = {
      id: generateId(),
      name: 'New chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats((prev) => [chat, ...prev]);
    setSelectedChatId(chat.id);
    setFocusMessageInputTrigger((n) => n + 1);
    return chat;
  }, [chats]);

  const addReferenceAudio = useCallback(
    async (chatId: string, blob: Blob, filename?: string) => {
      const dataUrl = await blobToDataUrl(blob);
      const name =
        (filename?.replace(/\.[^/.]+$/, '').slice(0, 30)) ??
        `Voice ${new Date().toLocaleDateString()}`;
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                name,
                referenceAudioDataUrl: dataUrl,
                referenceAudioBlob: blob,
                updatedAt: Date.now(),
              }
            : c
        )
      );
    },
    []
  );

  const setClonedVoice = useCallback((chatId: string, voiceId: string | number, voiceName?: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              clonedVoiceId: voiceId,
              clonedVoiceName: voiceName ?? c.clonedVoiceName,
              name: voiceName ? voiceName.slice(0, 30) : c.name,
              updatedAt: Date.now(),
            }
          : c
      )
    );
  }, []);

  const createChat = useCallback(
    async (referenceAudioBlob: Blob, filename?: string): Promise<Chat> => {
      const existingEmpty = chats.find(isEmptyChat);
      if (existingEmpty) {
        await addReferenceAudio(existingEmpty.id, referenceAudioBlob, filename);
        setSelectedChatId(existingEmpty.id);
        return { ...existingEmpty, referenceAudioDataUrl: '', referenceAudioBlob };
      }
      const dataUrl = await blobToDataUrl(referenceAudioBlob);
      const name = filename
        ? filename.replace(/\.[^/.]+$/, '').slice(0, 30)
        : `Voice ${new Date().toLocaleDateString()}`;
      const chat: Chat = {
        id: generateId(),
        name,
        referenceAudioDataUrl: dataUrl,
        referenceAudioBlob,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setChats((prev) => [chat, ...prev]);
      setSelectedChatId(chat.id);
      return chat;
    },
    [chats, addReferenceAudio]
  );

  const addMessage = useCallback(
    async (
      chatId: string,
      msg: {
        role: Message['role'];
        type: Message['type'];
        content: string;
      },
      options?: { userId: string; clonedVoiceName?: string; token?: string | null }
    ) => {
      const message: Message = {
        id: generateId(),
        role: msg.role,
        type: msg.type,
        content: msg.content,
        timestamp: Date.now(),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: [...c.messages, message],
                updatedAt: Date.now(),
              }
            : c
        )
      );

      if (!options?.userId) return;

      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'X-User-Id': options.userId,
        };
        if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            conversation_id: chatId,
            user_message: msg.content,
            ...(options.clonedVoiceName != null && options.clonedVoiceName !== ''
              ? { cloned_voice_name: options.clonedVoiceName }
              : {}),
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          agents_message?: string;
          agents_audio_clip?: string;
          conversation_id?: string;
          error?: string;
        };

        if (!res.ok) {
          const errMsg = typeof data?.error === 'string' ? data.error : 'Failed to get response';
          const assistantMessage: Message = {
            id: generateId(),
            role: 'assistant',
            type: 'text',
            content: `Error: ${errMsg}`,
            timestamp: Date.now(),
          };
          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId
                ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: Date.now() }
                : c
            )
          );
          return;
        }

        const agentsMessage = data.agents_message ?? '';
        const clip = data.agents_audio_clip;
        const audioDataUrl =
          typeof clip === 'string' && clip.length > 0
            ? `data:audio/wav;base64,${clip}`
            : undefined;

        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          type: 'text',
          content: agentsMessage || '(No response)',
          timestamp: Date.now(),
          ...(audioDataUrl && { audioDataUrl }),
        };
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: Date.now() }
              : c
          )
        );
      } catch (err) {
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          type: 'text',
          content: `Error: ${err instanceof Error ? err.message : 'Request failed'}`,
          timestamp: Date.now(),
        };
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: Date.now() }
              : c
          )
        );
      }
    },
    []
  );

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    setSelectedChatId((current) => (current === id ? null : current));
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      chats,
      selectedChatId,
      selectChat,
      focusMessageInputTrigger,
      requestFocusMessageInput,
      createEmptyChat,
      createChat,
      addReferenceAudio,
      setClonedVoice,
      addMessage,
      deleteChat,
    }),
    [
      chats,
      selectedChatId,
      selectChat,
      focusMessageInputTrigger,
      requestFocusMessageInput,
      createEmptyChat,
      createChat,
      addReferenceAudio,
      setClonedVoice,
      addMessage,
      deleteChat,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
