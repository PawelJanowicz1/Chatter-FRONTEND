import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {ChatMessage} from '../../../core/interface/backend-models/chat/chat-message.interface';
import {ChatService} from '../../../apis/chat/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  text = '';

  nick = signal<string>(localStorage.getItem('chatter_nick') || '');
  connected = signal<boolean>(false);

  private sub?: Subscription;
  private stateSub?: Subscription;

  constructor(private chat: ChatService) {}

  ngOnInit(): void {
    if (!this.nick() || this.nick().trim().length < 3) {
      let nick = '';
      while (!nick || nick.trim().length < 3) {
        nick = prompt('Set your nickname (min. 3 characters):', '') ?? '';
      }
      nick = nick.trim();
      localStorage.setItem('chatter_nick', nick);
      this.nick.set(nick);
    }

    this.chat.connect(this.nick());

    this.sub = this.chat.messages$.subscribe(message => {
      this.messages.push(message);
      queueMicrotask(() => {
        const box = document.querySelector('.box') as HTMLElement | null;
        if (box) box.scrollTop = box.scrollHeight;
      });
    });

    this.stateSub = this.chat.state$.subscribe(s => this.connected.set(s === 'connected'));
  }

  send() {
    const trim = this.text.trim();
    if (!trim) return;
    this.chat.sendChat(trim);
    this.text = '';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.stateSub?.unsubscribe();
    this.chat.disconnect();
  }
}
