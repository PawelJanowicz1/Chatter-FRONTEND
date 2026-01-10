import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {RoomResponse} from '../../../core/interface/backend-models/room/room-response.interface';
import {RoomService} from '../../../apis/room/room.service';
import {RoomCreateRequest} from '../../../core/interface/backend-models/room/room-create-request.interface';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomsComponent implements OnInit {

  rooms: RoomResponse[] = [];
  name = '';
  maxCapacity = 10;
  isPrivate = true;

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getPublicRooms().subscribe(res => this.rooms = res);
  }

  createRoom(): void {
    const payload: RoomCreateRequest = {
      name: this.name.trim(),
      maxCapacity: this.maxCapacity,
      isPrivate: this.isPrivate
    };

    if (!payload.name) return;

    this.roomService.createRoom(payload).subscribe(() => {
      this.loadRooms();
      this.name = '';
      this.maxCapacity = 10;
      this.isPrivate = true;
    });
  }

  joinRoom(room: RoomResponse): void {
    alert('TODO: Wejście do pokoju ' + room.name);
  }
}
