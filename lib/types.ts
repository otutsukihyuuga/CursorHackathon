/** A chat similar to ChatGPT. Can start empty; reference audio can be added later. */
export interface Chat {
  id: string;
  name: string;
  /** Reference audio as base64 data URL. Empty when chat has no voice yet. */
  referenceAudioDataUrl?: string;
  referenceAudioBlob?: Blob;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type MessageRole = 'user' | 'assistant';

export type MessageType = 'text' | 'audio';

export interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  /** For text: the text content. For audio: base64 data URL or object URL (ephemeral). */
  content: string;
  timestamp: number;
}
