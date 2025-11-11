import { Component } from '@angular/core';
import {ChatComponent} from './feature/chat.component/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {}
