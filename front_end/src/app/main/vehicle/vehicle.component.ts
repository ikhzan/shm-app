import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RestService } from '../../services/rest.service';
import { Router } from '@angular/router';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface Sensor {
  position_x: number; // left %
  position_y: number; // top %
  icon: string;
  device_name: string;
  value: number;
  status: string;
}

@Component({
  selector: 'app-vehicle',
  imports: [FormsModule, FontAwesomeModule, NgIf, NgFor, NgClass],
  providers: [DatePipe],
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.scss'
})
export class VehicleComponent {
  faSearch = faSearch;
  formON: boolean = false;
  allVehicles: any[] = [];
  vehicles: any[] = [];
  unlinkedSensors: Sensor[] = [];
  sensors: Sensor[] = [];
  isLoading: boolean = false;
  sensorId: number | null = null;
  isAuthenticated = false;
  modalDeleteON = true
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  shipHull = 'assets/ships/ship-hull.gif'
  baseUrl: string = 'http://localhost:8000';

  constructor(private readonly authService: AuthService,
    private readonly restService: RestService,
    private readonly router: Router) {
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadVehicleData()
  }

  getImageUrl(imagePath: string): string {
    return this.baseUrl + imagePath; // Construct the full image URL
  }

  private loadVehicleData(): void {
    this.isLoading = true;
    this.restService.fetchVehicle().subscribe({
      next: (data) => {
        this.vehicles = data.vehicles;
        this.unlinkedSensors = data.unlinked_sensors;

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  toggleForm() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.formON = !this.formON;
  }

  async onSubmit(form: NgForm) {
    try {
      const vehicleData = {
        name: form.value['name'],
        image_path: form.value['image_path']
      }
      const sendData = await this.restService.newVehicle(vehicleData);
      console.log("on-submit response " + sendData);
      form.reset();
      this.loadVehicleData()
    } catch (error) {
      console.log("error on-submit " + error)
    }
  }

  showDeleteModal(id: number) {
    console.log("Delete sensor " + id);
    this.sensorId = id;
    this.modalDeleteON = false
  }

  closeDeleteModal() {
    this.sensorId = null;
    this.modalDeleteON = true
  }

  deleteFile() {
    if (this.sensorId === null) return;

    this.restService.deleteEndDevice(this.sensorId).subscribe({
      next: () => {
        console.log(`Sensor ${this.sensorId} deleted`);
        this.closeDeleteModal();
        this.loadVehicleData();
      },
      error: err => {
        console.error('Delete failed:', err);
      }
    });
  }

  placeSensor(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const sensor: Sensor = {
      position_x: parseFloat(x.toFixed(2)),
      position_y: parseFloat(y.toFixed(2)),
      icon: '📍',
      device_name: `Sensor ${this.sensors.length - 1}`,
      value: 0,
      status: 'unknown'
    };

    this.sensors.push(sensor);
    console.log(`Placed at x: ${sensor.position_x}%, y: ${sensor.position_y}%`);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  getLampClass(value: number): string {
    if (value < 50) return 'lamp-green';
    if (value < 70) return 'lamp-yellow';
    return 'lamp-red';
  }

  getStatusClass(status: string): string {
    return status === 'online' ? 'status-online' : 'status-offline';
  }

  editSensor(device_id: string) {
    // Open form or modal with sensor data
  }

  deleteSensor(device_id: string) {
    // Confirm and delete logic
  }

}
