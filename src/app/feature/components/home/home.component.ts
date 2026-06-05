import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import { RoomService } from '../../../apis/room/room.service';
import { RoomResponse } from '../../../core/interface/backend-models/room/room-response.interface';
import { ChatComponent } from '../chat/chat.component';
import {RoomCreateComponent} from '../create-room/room-create.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ChatComponent, RoomCreateComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  rooms: RoomResponse[] = [];
  showCreateModal = false;

  constructor(private roomService: RoomService, private router: Router) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getPublicRooms().subscribe(res => {
      this.rooms = res;
    });
  }

  openCreateRoom(): void {
    this.showCreateModal = true;
  }

  closeCreateRoom(): void {
    this.showCreateModal = false;
  }

  onRoomCreated(): void {
    this.closeCreateRoom();
    this.loadRooms();
  }

  joinRoom(room: RoomResponse): void {
    this.router.navigate(['/room', room.id]);
  }
}
