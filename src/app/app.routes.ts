import { Routes } from '@angular/router';
import {HomeComponent} from './feature/components/home/home.component';
import {RoomsComponent} from './feature/components/room/room.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'rooms', component: RoomsComponent }
];
