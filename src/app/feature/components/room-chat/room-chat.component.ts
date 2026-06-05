import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../apis/chat/chat.service';
import { RoomService } from '../../../apis/room/room.service';
import { ChatMessage } from '../../../core/interface/backend-models/chat/chat-message.interface';
import { RoomResponse } from '../../../core/interface/backend-models/room/room-response.interface';

@Component({
  selector: 'app-room-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-chat.component.html',
  styleUrls: ['./room-chat.component.scss']
})
export class RoomChatComponent implements OnInit, OnDestroy {
  room: RoomResponse | null = null;
  messages: ChatMessage[] = [];
  text = '';
  passwordInput = '';
  passwordError = '';

  connected = signal<boolean>(false);
  showPasswordModal = signal<boolean>(false);
  loading = signal<boolean>(false);

  private roomId!: number;
  private nick = '';
  private messageSubscription?: Subscription;
  private stateSubscription?: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.nick = localStorage.getItem('chatter_nick') ?? '';

    if (!this.nick || this.nick.trim().length < 3) {
      this.router.navigate(['/']);
      return;
    }

    this.roomId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    this.messageSubscription = this.chatService.roomMessages$.subscribe(message => {
      this.messages.push(message);
      queueMicrotask(() => {
        const chatBox = document.querySelector('.room-messages') as HTMLElement | null;
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
      });
    });

    this.stateSubscription = this.chatService.state$.subscribe(state => {
      this.connected.set(state === 'connected');
    });

    this.roomService.getRoomById(this.roomId).subscribe({
      next: room => {
        this.room = room;
        const justCreated = history.state?.justCreated === true;
        if (room.isPrivate && !justCreated) {
          this.showPasswordModal.set(true);
        } else {
          this.connectToRoom();
        }
      },
      error: () => this.router.navigate(['/'])
    });
  }

  submitPassword(): void {
    if (this.passwordInput.trim().length < 3) return;

    this.loading.set(true);
    this.passwordError = '';

    this.roomService.joinRoom(this.roomId, { password: this.passwordInput.trim() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.showPasswordModal.set(false);
        this.connectToRoom();
      },
      error: () => {
        this.loading.set(false);
        this.passwordError = 'Nieprawidłowe hasło. Spróbuj ponownie.';
      }
    });
  }

  private connectToRoom(): void {
    if (!this.chatService.isConnected()) {
      this.chatService.connect(this.nick, false);
    }
    this.chatService.joinRoom(String(this.roomId));
  }

  send(): void {
    const trimmedText = this.text.trim();
    if (!trimmedText) return;
    this.chatService.sendRoomChat(trimmedText, String(this.roomId));
    this.text = '';
  }

  leaveRoom(): void {
    this.chatService.leaveRoom();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.stateSubscription?.unsubscribe();
    this.chatService.leaveRoom();
  }
}
