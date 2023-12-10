import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { MoodleSyncComponent } from './components/moodle-sync/moodle-sync.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule, 
    RouterOutlet,
    MoodleSyncComponent,
  ]
})
export class AppComponent {
  title = 'UIS';
}
