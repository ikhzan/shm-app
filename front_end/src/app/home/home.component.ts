import { Component, OnInit } from '@angular/core';
import { BrokerService } from '../services/broker.service';
import { NgFor } from '@angular/common';
import { RestService } from '../services/rest.service';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  imports: [NgFor, LeafletModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  messages: any[] = [];
  status: string = "unknown";
  dataSensor: any[] = [];
  displayedColumns: string[] = ['device_id', 'timestamp', 'battery', 'temperature', 'humidity', 'location'];
  private map!: L.Map;

  constructor(private brokerService: BrokerService, private restService: RestService) {
  }

  // options = {
  //   layers: [
  //     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //       attribution: '© OpenStreetMap contributors'
  //     })
  //   ],
  //   zoom: 13,
  //   center: L.latLng(41.02307, 28.78152) // Replace with dynamic coords
  // };


  ngOnInit(): void {
    this.brokerService.messages$.subscribe(data => {
      this.messages.unshift(data);

      this.restService.fetchDataSensor().subscribe(data => {
        this.dataSensor = data;
        console.log("data " + this.dataSensor)
      });
    });

    this.brokerService.status$.subscribe(data => {
      this.status = data
    });

    // Initial fetch (optional)
    this.restService.fetchDataSensor().subscribe(sensorData => {
      this.dataSensor = sensorData;
      console.log("📦 Initial sensor data:", this.dataSensor);
    });


  }

  ngAfterViewInit(): void {
    this.map = L.map('map').setView([41.02307, 28.78152], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([41.02307, 28.78152]).addTo(this.map).bindPopup('Sensor Location');

    setTimeout(() => {
      this.map.invalidateSize();  // ✅ Fix tile misalignment
    }, 100);
  }



}
