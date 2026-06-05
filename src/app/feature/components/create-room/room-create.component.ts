import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../../apis/room/room.service';
import { RoomCreateRequest } from '../../../core/interface/backend-models/room/room-create-request.interface';
import { RoomResponse } from '../../../core/interface/backend-models/room/room-response.interface';

@Component({
  selector: 'app-room-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-create.component.html',
  styleUrls: ['./room-create.component.scss']
})
export class RoomCreateComponent {

  @Output() created = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  name = '';
  maxCapacity = 10;
  isPrivate = false;
  password = '';
  loading = false;

  get isFormValid(): boolean {
    if (!this.name.trim()) return false;
    if (this.isPrivate && this.password.trim().length < 3) return false;
    return true;
  }

  constructor(
    private roomService: RoomService,
    private router: Router
  ) {}

  create(): void {
    if (!this.isFormValid) return;

    const payload: RoomCreateRequest = {
      name: this.name.trim(),
      maxCapacity: this.maxCapacity,
      isPrivate: this.isPrivate,
      password: this.isPrivate ? this.password.trim() : undefined
    };

    this.loading = true;

    this.roomService.createRoom(payload).subscribe({
      next: (createdRoom: RoomResponse) => {
        this.loading = false;
        this.saveRoomAccess(createdRoom.id);
        this.router.navigate(['/room', createdRoom.id]);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private saveRoomAccess(roomId: number): void {
    const stored = localStorage.getItem('chatter_room_access');
    const accessibleRooms: number[] = stored ? JSON.parse(stored) : [];
    if (!accessibleRooms.includes(roomId)) {
      accessibleRooms.push(roomId);
      localStorage.setItem('chatter_room_access', JSON.stringify(accessibleRooms));
    }
  }
}
