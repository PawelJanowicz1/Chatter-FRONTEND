import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomResponse } from '../../core/interface/backend-models/room/room-response.interface';
import { RoomCreateRequest } from '../../core/interface/backend-models/room/room-create-request.interface';
import { environment } from '../../../environments/environment';
import {RoomJoinRequest} from '../../core/interface/backend-models/room/room-join-request.interface';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private httpClient: HttpClient) {}

  createRoom(payload: RoomCreateRequest): Observable<RoomResponse> {
    return this.httpClient.post<RoomResponse>(`${this.apiBaseUrl}/create-room`, payload);
  }

  getPublicRooms(): Observable<RoomResponse[]> {
    return this.httpClient.get<RoomResponse[]>(`${this.apiBaseUrl}/rooms`);
  }

  joinRoom(roomId: number, payload: RoomJoinRequest): Observable<void> {
    return this.httpClient.post<void>(`${this.apiBaseUrl}/rooms/${roomId}/join`, payload);
  }

  getRoomById(roomId: number): Observable<RoomResponse> {
    return this.httpClient.get<RoomResponse>(`${this.apiBaseUrl}/rooms/${roomId}`);
  }
}
