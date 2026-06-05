import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ChatMessage } from '../../core/interface/backend-models/chat/chat-message.interface';
import SockJS from 'sockjs-client';
import { MessageType } from '../../core/interface/backend-models/chat/message-type.enum';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private client: Client | null = null;
  private roomSubscription: StompSubscription | null = null;

  private readonly wsUrl = `${environment.apiBaseUrl}/ws`;
  private readonly publicMessagesUrl = `${environment.apiBaseUrl}/messages/public`;

  private _state$ = new BehaviorSubject<'disconnected' | 'connecting' | 'connected'>('disconnected');
  readonly state$ = this._state$.asObservable();

  private _messages$ = new Subject<ChatMessage>();
  readonly messages$ = this._messages$.asObservable();

  private _roomMessages$ = new Subject<ChatMessage>();
  readonly roomMessages$ = this._roomMessages$.asObservable();

  private nick = '';
  private currentRoomId: string | null = null;

  constructor(private httpClient: HttpClient) {}

  getPublicMessages(): Observable<ChatMessage[]> {
    return this.httpClient.get<ChatMessage[]>(this.publicMessagesUrl);
  }

  connect(nick: string, sendJoinMessage = true) {
    if (this.client?.active) return;
    this.nick = nick.trim();
    this._state$.next('connecting');

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 2000,
      onConnect: () => {
        this._state$.next('connected');
        this.client!.subscribe('/topic/public', (frame: IMessage) => {
          const msg = JSON.parse(frame.body) as ChatMessage;
          this._messages$.next(msg);
        });

        if (sendJoinMessage) {
          this.send({ messageType: MessageType.JOIN, sender: this.nick, content: '' });
        }
      },
      onWebSocketClose: () => this._state$.next('disconnected'),
      onStompError: e => console.error('STOMP error:', e.headers['message'], e.body)
    });

    this.client.activate();
  }

  joinRoom(roomId: string, sendJoinMessage = true) {
    this.leaveRoom(false);
    this.currentRoomId = roomId;

    const subscribeToRoom = () => {
      this.roomSubscription = this.client!.subscribe(
        `/topic/room/${roomId}`,
        (frame: IMessage) => {
          const msg = JSON.parse(frame.body) as ChatMessage;
          this._roomMessages$.next(msg);
        }
      );

      if (sendJoinMessage) {
        this.sendToRoom({ messageType: MessageType.JOIN, sender: this.nick, content: '' }, roomId);
      }
    };

    if (this.client?.connected) {
      subscribeToRoom();
    } else {
      const stateSubscription = this._state$.subscribe(state => {
        if (state === 'connected') {
          subscribeToRoom();
          stateSubscription.unsubscribe();
        }
      });
    }
  }

  leaveRoom(sendLeaveMessage = true) {
    if (sendLeaveMessage && this.currentRoomId && this.client?.connected) {
      this.sendToRoom({ messageType: MessageType.LEAVE, sender: this.nick, content: '' }, this.currentRoomId);
    }
    this.roomSubscription?.unsubscribe();
    this.roomSubscription = null;
    this.currentRoomId = null;
  }

  sendChat(text: string) {
    const content = text?.trim();
    if (!content || !this.client?.connected) return;

    this.send({
      messageType: MessageType.CHAT,
      sender: this.nick,
      content
    });
  }

  sendRoomChat(text: string, roomId: string) {
    const content = text?.trim();
    if (!content || !this.client?.connected) return;

    this.sendToRoom({ messageType: MessageType.CHAT, sender: this.nick, content }, roomId);
  }

  disconnect(sendLeaveMessage = true) {
    this.leaveRoom(sendLeaveMessage);

    if (sendLeaveMessage && this.client?.connected) {
      this.send({ messageType: MessageType.LEAVE, sender: this.nick, content: '' });
    }

    this.client?.deactivate();
    this.client = null;
    this._state$.next('disconnected');
  }

  private send(msg: ChatMessage) {
    this.client?.publish({
      destination: '/app/general/chat',
      body: JSON.stringify(msg)
    });
  }

  private sendToRoom(msg: ChatMessage, roomId: string) {
    this.client?.publish({
      destination: `/app/room/${roomId}/chat`,
      body: JSON.stringify(msg)
    });
  }

  sendSystemMessage(content: string) {
    const trimmedContent = content?.trim();
    if (!trimmedContent || !this.client?.connected) return;

    this.send({ messageType: MessageType.SYSTEM, sender: this.nick, content: trimmedContent });
  }

  getNick(): string {
    return this.nick;
  }

  ngOnDestroy() {
    this.disconnect();
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}
