import { Component, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { DeleteDataModalComponent } from '../../../shared/delete-data-modal/delete-data-modal.component';
import { LoginModalComponent } from '../../../shared/login-modal/login-modal.component';
import { AuthService } from '../../../services/auth.service';
import { RestService } from '../../../services/rest.service';
import { MediaService } from '../../../services/media.service';

export interface Credentials {
  username: string
  password: string
}

interface Sensor {
  id: number;
  position_x: number; // left %
  position_y: number; // top %
  device_name: string;
  value: number;
  device_status: string;
}

@Component({
  selector: 'app-vehicle',
  imports: [FormsModule, FontAwesomeModule, NgIf, NgFor, NgClass, RouterLink, DeleteDataModalComponent, LoginModalComponent],
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
  placedSensors: Sensor[] = [];
  isLoading: boolean = false;
  vehicleId: number | null = null;
  isAuthenticated = false;
  modalDeleteON = false
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  loginModalON = false;
  shipHull = 'assets/ships/ship-hull.gif'
  @ViewChild(LoginModalComponent) loginModal!: LoginModalComponent;

  constructor(private readonly authService: AuthService,
    private readonly restService: RestService, private mediaService: MediaService) {
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadVehicleData()
  }

  getImage(path: string): string {
    return this.mediaService.getImageUrl(path);
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
      this.openLoginModal();
    } else {
      this.formON = !this.formON;
    }

  }

  async onSubmit(form: NgForm) {
    try {
      const formData = new FormData();
      formData.append('name', form.value['name']);
      if (this.selectedFile) {
        formData.append('image_path', this.selectedFile);
      }
      const sensorPayload = this.placedSensors.map(sensor => ({
        id: sensor.id,
        position_x: sensor.position_x,
        position_y: sensor.position_y
      }));

      formData.append('end_devices', JSON.stringify(sensorPayload));
      const sendData = await this.restService.newVehicle(formData);
      console.log("on-submit response " + sendData);

      form.reset();
      this.imagePreview = null;
      this.placedSensors = [];
      this.loadVehicleData()
    } catch (error) {
      console.log("error on-submit " + error)
    }
  }

  showDeleteModal(id: number) {
    console.log("Delete vehicle " + id);
    this.vehicleId = id;
    this.modalDeleteON = true
  }

  closeDeleteModal() {
    this.vehicleId = null;
    this.modalDeleteON = false
  }

  deleteFile() {
    if (this.vehicleId === null) return;

    this.restService.deleteEndDevice(this.vehicleId).subscribe({
      next: () => {
        console.log(`Sensor ${this.vehicleId} deleted`);
        this.closeDeleteModal();
        this.loadVehicleData();
      },
      error: err => {
        console.error('Delete failed:', err);
      }
    });
  }

  placeHolder(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const removedSensor = this.unlinkedSensors.pop();
    if (!removedSensor) {
      console.warn('No unlinked sensors left to place.');
      return;
    }

    const sensor: Sensor = {
      id: removedSensor.id,
      position_x: parseFloat(x.toFixed(2)),
      position_y: parseFloat(y.toFixed(2)),
      device_name: removedSensor.device_name,
      value: 20,
      device_status: 'online'
    };

    this.placedSensors.push(sensor);
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

  editVehicle(device_id: string) {
    // Open form or modal with sensor data
  }

  deleteVehicle() {
    if (this.vehicleId === null) return;

    this.restService.deleteVehicle(this.vehicleId).subscribe({
      next: () => {
        console.log(`Sensor ${this.vehicleId} deleted`);
        this.closeDeleteModal();
        this.loadVehicleData();
      },
      error: err => {
        console.error('Delete failed:', err);
      }
    });
  }

  openLoginModal() {
    this.loginModalON = true;
  }

  closeLoginModal() {
    this.loginModalON = false;
  }

  handleLogin(credentials: Credentials) {
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.loginModal.resetState();
        this.closeLoginModal();
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.loginModal.showError('Invalid username or password.');
      }
    });
  }
}
