/** A chat similar to ChatGPT. Can start empty; reference audio can be added later. */
export interface Chat {
  id: string;
  name: string;
  /** Reference audio as base64 data URL. Empty when chat has no voice yet. */
  referenceAudioDataUrl?: string;
  referenceAudioBlob?: Blob;
  /** Selected cloned voice name to send on chat API requests. */
  clonedVoiceName?: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

/** Cloned voice item from GET /users/{user-id}/cloned-voices */
export interface ClonedVoice {
  id: string | number;
  name?: string;
  voice_name?: string;
  display_name?: string;
  audio_url?: string;
  [key: string]: unknown;
}

export type MessageRole = 'user' | 'assistant';

export type MessageType = 'text' | 'audio';

export interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  /** Text content (for voice messages, this is the transcript). */
  content: string;
  timestamp: number;
  /** Assistant voice response as data URL (audio/wav). Not persisted. */
  audioDataUrl?: string;
}
