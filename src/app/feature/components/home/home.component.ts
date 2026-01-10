import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoomService } from '../../../apis/room/room.service';
import { RoomResponse } from '../../../core/interface/backend-models/room/room-response.interface';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ChatComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  rooms: RoomResponse[] = [];

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.roomService.getPublicRooms().subscribe(res => {
      this.rooms = res;
    });
  }

  joinRoom(room: RoomResponse): void {
    alert(`TODO: dołączanie do pokoju ${room.name} (id=${room.id})`);
  }
}
