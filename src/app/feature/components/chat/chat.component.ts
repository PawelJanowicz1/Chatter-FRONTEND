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

  nick = signal<string>('');
  connected = signal<boolean>(false);
  showNickModal = signal<boolean>(true);
  allowCloseNickModal = signal<boolean>(false);
  nickInput = '';

  private sub?: Subscription;
  private stateSub?: Subscription;
  private historySub?: Subscription;

  constructor(private chat: ChatService) {}

  ngOnInit(): void {
    const savedNick = localStorage.getItem('chatter_nick');

    if (savedNick && savedNick.trim().length >= 3) {
      this.nick.set(savedNick.trim());
      this.nickInput = savedNick.trim();
      this.showNickModal.set(false);
      this.allowCloseNickModal.set(true);
      this.loadHistoryAndConnect();
    } else {
      localStorage.removeItem('chatter_nick');
      this.nick.set('');
      this.nickInput = '';
      this.showNickModal.set(true);
      this.allowCloseNickModal.set(false);
    }

    this.sub = this.chat.messages$.subscribe(message => {
      this.messages.push(message);
      queueMicrotask(() => {
        const box = document.querySelector('.chat-messages') as HTMLElement | null;
        if (box) box.scrollTop = box.scrollHeight;
      });
    });

    this.stateSub = this.chat.state$.subscribe(s => this.connected.set(s === 'connected'));
  }

  saveNick() {
    const trimmedNick = this.nickInput.trim();

    if (trimmedNick.length < 3) {
      return;
    }

    const previousNick = this.nick();

    localStorage.setItem('chatter_nick', trimmedNick);
    this.nick.set(trimmedNick);
    this.nickInput = trimmedNick;
    this.showNickModal.set(false);
    this.allowCloseNickModal.set(true);

    if (!previousNick) {
      this.loadHistoryAndConnect();
      return;
    }

    if (previousNick !== trimmedNick) {
      this.chat.sendSystemMessage(`${previousNick} changed nickname to ${trimmedNick}`);
      this.chat.disconnect(false);
      this.connected.set(false);
      this.messages = [];
      this.loadHistoryAndConnect(false);
    }
  }

  changeNick() {
    this.nickInput = this.nick();
    this.showNickModal.set(true);
    this.allowCloseNickModal.set(true);
  }

  closeNickModal() {
    this.nickInput = this.nick();
    this.showNickModal.set(false);
  }

  private loadHistoryAndConnect(sendJoinMessage = true) {
    this.historySub?.unsubscribe();

    this.historySub = this.chat.getPublicMessages().subscribe({
      next: messages => {
        this.messages = messages;

        queueMicrotask(() => {
          const box = document.querySelector('.chat-messages') as HTMLElement | null;
          if (box) box.scrollTop = box.scrollHeight;
        });

        this.chat.connect(this.nick(), sendJoinMessage);
      },
      error: error => {
        console.error('Failed to load public messages history', error);
        this.chat.connect(this.nick(), sendJoinMessage);
      }
    });
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
    this.historySub?.unsubscribe();
    this.chat.disconnect();
  }
}
