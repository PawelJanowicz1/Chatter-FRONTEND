import {MessageType} from './message-type.enum';

export interface ChatMessage {
  messageType: MessageType;
  sender?: string | null;
  recipient?: string | null;
  roomId?: string | null;
  content?: string | null;
  sentAt?: string | null;
}
