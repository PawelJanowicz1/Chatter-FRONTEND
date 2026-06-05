import { Routes } from '@angular/router';
import { HomeComponent } from './feature/components/home/home.component';
import { RoomsComponent } from './feature/components/room/room.component';
import { RoomChatComponent } from './feature/components/room-chat/room-chat.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'rooms', component: RoomsComponent },
  { path: 'room/:id', component: RoomChatComponent }
];
