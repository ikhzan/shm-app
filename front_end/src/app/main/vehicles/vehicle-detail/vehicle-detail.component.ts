import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { RestService } from '../../../services/rest.service';
import { MediaService } from '../../../services/media.service';
import { LoadingSpinnerService } from '../../../shared/loading-spinner/loading-spinner.service';

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
