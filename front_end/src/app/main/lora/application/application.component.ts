import { Component } from '@angular/core';
import { LoadingSpinnerService } from '../../../shared/loading-spinner/loading-spinner.service';

@Component({
  selector: 'application',
  imports: [],
  templateUrl: './application.component.html',
  styleUrl: './application.component.scss'
})
export class LoraAppComponent {
  constructor(private loadingService: LoadingSpinnerService){

  }
}
