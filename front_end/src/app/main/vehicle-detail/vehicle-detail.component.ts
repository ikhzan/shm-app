import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-vehicle-detail',
  imports: [NgFor, NgIf],
  templateUrl: './vehicle-detail.component.html',
  styleUrl: './vehicle-detail.component.scss'
})
export class VehicleDetailComponent implements OnInit {
  vehicleID = ""
  dataVehicle: any[] = [];
  isLoading: boolean = false;
  
  constructor(private route: ActivatedRoute,
    private readonly restService: RestService, private mediaService: MediaService) {

  }

  ngOnInit(): void {
    this.loadVehicleData()
  }

  private loadVehicleData(): void {
    this.vehicleID = this.route.snapshot.paramMap.get('id')!;

    this.restService.fetchDataByVehicleId(this.vehicleID).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (Array.isArray(data) && data.length > 0) {
          this.dataVehicle = data;
          this.vehicleID = this.dataVehicle[0].name
        } else {
          console.warn('Vehicle data is empty or malformed', data);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching vehicle data: ', err)
      }
    });
  }

  getImage(path: string): string {
    return this.mediaService.getImageUrl(path);
  }

}
