import {Injectable, OnDestroy} from '@angular/core';
import {Client, IMessage} from '@stomp/stompjs';
import {BehaviorSubject, Subject} from 'rxjs';
import {ChatMessage} from '../../core/interface/backend-models/chat/chat-message.interface';
import SockJS from 'sockjs-client';
import {MessageType} from '../../core/interface/backend-models/chat/message-type.enum';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class ChatService implements OnDestroy {
  private client: Client | null = null;

  private readonly wsUrl = `${environment.apiBaseUrl}/ws`;
  private _state$ = new BehaviorSubject<'disconnected' | 'connecting' | 'connected'>('disconnected');
  readonly state$ = this._state$.asObservable();
  private _messages$ = new Subject<ChatMessage>();
  readonly messages$ = this._messages$.asObservable();

  private nick = '';

  connect(nick: string) {
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

        this.send({messageType: MessageType.JOIN, sender: this.nick, content: ''});
      },
      onWebSocketClose: () => this._state$.next('disconnected'),
      onStompError: e => console.error('STOMP error:', e.headers['message'], e.body)
    });

    this.client.activate();
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

  disconnect() {
    if (this.client?.connected) {
      this.send({
        messageType: MessageType.LEAVE,
        sender: this.nick,
        content: ''
      });
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

  ngOnDestroy() {
    this.disconnect();
  }
}
