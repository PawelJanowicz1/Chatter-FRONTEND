import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../apis/room/room.service';
import { RoomCreateRequest } from '../../../core/interface/backend-models/room/room-create-request.interface';

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
  loading = false;

  constructor(private roomService: RoomService) {}

  create(): void {
    if (!this.name.trim()) return;

    const payload: RoomCreateRequest = {
      name: this.name.trim(),
      maxCapacity: this.maxCapacity,
      isPrivate: this.isPrivate
    };

    this.loading = true;

    this.roomService.createRoom(payload).subscribe(() => {
      this.loading = false;
      this.created.emit();
    });
  }
}
