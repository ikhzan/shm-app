import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { RestService } from '../../services/rest.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-lora',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './lora.component.html',
  styleUrl: './lora.component.scss'
})
export class LoraComponent {
  loadingLora: string | null = "Load Lora"
  loadApps: any[] = [];

  constructor(private restService: RestService){

  }

  loadLoraApp(){
    this.loadingLora = "Loading..."
    this.restService.fetchLoraApp().subscribe({
      next: (data) => {
        console.log(`Data Lora Devices ${data}`)
        this.loadingLora = "Load Lora"
        this.loadApps = data;
      },
      error: (e) => {
        this.loadingLora = 'Error'
        console.log(`Error fetch data lora ${e}`)
        this.loadingLora = "Load Lora"
      }
    })
  }
}
