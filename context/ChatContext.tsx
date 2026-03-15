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

function loadChats(): Chat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveChats(chats: Chat[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
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
  /** Create a new empty chat (ChatGPT-style). Reuses existing empty chat to prevent spam. */
  createEmptyChat: () => Chat;
  /** Create chat with reference audio, or add audio to an existing empty chat. */
  createChat: (referenceAudioBlob: Blob, filename?: string) => Promise<Chat>;
  addReferenceAudio: (chatId: string, blob: Blob, filename?: string) => Promise<void>;
  addMessage: (
    chatId: string,
    message: {
      role: Message['role'];
      type: Message['type'];
      content: string | Blob;
    }
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
      msg: { role: Message['role']; type: Message['type']; content: string | Blob }
    ) => {
      const content =
        typeof msg.content === 'string'
          ? msg.content
          : await blobToDataUrl(msg.content as Blob);

      const message: Message = {
        id: generateId(),
        role: msg.role,
        type: msg.type,
        content,
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

      // TODO: API call - send message (text or audio), get response
      // await api.sendMessage(chatId, { type: msg.type, content });
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
      createEmptyChat,
      createChat,
      addReferenceAudio,
      addMessage,
      deleteChat,
    }),
    [
      chats,
      selectedChatId,
      selectChat,
      createEmptyChat,
      createChat,
      addReferenceAudio,
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
