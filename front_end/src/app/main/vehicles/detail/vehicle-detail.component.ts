import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { RestService } from '../../../services/rest.service';
import { MediaService } from '../../../services/media.service';
import { LoadingSpinnerService } from '../../../shared/loading-spinner/loading-spinner.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-vehicle-detail',
  imports: [NgFor, NgIf],
  templateUrl: './vehicle-detail.component.html',
  styleUrl: './vehicle-detail.component.scss'
})
export class VehicleDetailComponent implements OnInit {
  vehicleID = ""
  dataVehicle: any[] = [];

  constructor(private route: ActivatedRoute,
    private readonly restService: RestService,
    private mediaService: MediaService,
    private loadingService: LoadingSpinnerService) {
  }

  ngOnInit(): void {
    this.loadVehicleData()
  }

  ngAfterViewChecked(): void {
    this.dataVehicle.forEach(vehicle => {
      this.initializeMapForVehicle(vehicle);
    });
  }

  private initializeMapForVehicle(vehicle: any): void {
    const mapId = 'map-' + vehicle.name;
    const container = document.getElementById(mapId);

    if (!container || container.hasAttribute('data-map-initialized') || !vehicle.end_devices?.length) return;

    const firstValidSensor = vehicle.end_devices.find((s: any) => s.last_data?.latitude && s.last_data?.longitude);
    if (!firstValidSensor) return;

    const map = L.map(mapId).setView(
      [firstValidSensor.last_data.latitude, firstValidSensor.last_data.longitude],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    const DefaultIcon = L.icon({
      iconUrl: 'assets/leaflet/marker-icon.png',
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    vehicle.end_devices.forEach((sensor: any) => {
      const lat = sensor.last_data?.latitude;
      const lng = sensor.last_data?.longitude;

      if (lat && lng) {
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(sensor.device_name);
      }
    });

    container.setAttribute('data-map-initialized', 'true');
  }

  private loadVehicleData(): void {
    this.loadingService.show();
    this.vehicleID = this.route.snapshot.paramMap.get('id')!;

    this.restService.fetchDataByVehicleId(this.vehicleID).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.dataVehicle = data;
          this.vehicleID = this.dataVehicle[0].name
          this.loadingService.hide();
        } else {
          console.warn('Vehicle data is empty or malformed', data);
          this.loadingService.hide();
        }
      },
      error: (err) => {
        this.loadingService.hide();
        console.error('Error fetching vehicle data: ', err)
      }
    });
  }

  getImage(path: string): string {
    return this.mediaService.getImageUrl(path);
  }

}
