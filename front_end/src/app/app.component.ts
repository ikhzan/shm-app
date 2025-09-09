import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { LoadingSpinnerService } from './shared/loading-spinner/loading-spinner.service';
import { Observable } from 'rxjs';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, LoadingSpinnerComponent],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  
  ngOnInit(): void {
   
  }

}
