import { Component, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt, faClose, faSearch } from '@fortawesome/free-solid-svg-icons';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RestService } from '../../services/rest.service';
import { AuthService } from '../../services/auth.service';
import { DeleteDataModalComponent } from '../../shared/delete-data-modal/delete-data-modal.component';
import { LoginModalComponent } from '../../shared/login-modal/login-modal.component';
import { RouterLink } from '@angular/router';

export interface Credentials {
  username: string
  password: string
}

@Component({
  selector: 'app-sensor',
  imports: [FontAwesomeModule,RouterLink, NgFor, NgIf, NgClass, FormsModule, DeleteDataModalComponent, LoginModalComponent],
  templateUrl: './sensor.component.html',
  styleUrl: './sensor.component.scss'
})
export class SensorComponent implements OnInit {
  faSearch = faSearch
  faTrash = faTrashAlt
  faClose = faClose
  modalDeleteON = false
  allSensors: any[] = [];
  dataSensor: any[] = [];
  isLoading: boolean = false;
  searchTerm = '';
  pageSize = 10;
  currentPage = 1;
  Math = Math
  isOn: boolean = false;
  formON: boolean = false;
  sensorId: number | null = null;
  isAuthenticated = false;
  baseUrl: string = 'http://localhost:8000';
  loginModalON = false;
  @ViewChild(LoginModalComponent) loginModal!: LoginModalComponent;

  constructor(private restService: RestService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadSensorData()
  }

  getImageUrl(imagePath: string): string {
    return this.baseUrl + imagePath; // Construct the full image URL
  }

  private loadSensorData(): void {
    this.isLoading = true;
    this.restService.fetchDataDevice().subscribe({
      next: (data) => {
        this.allSensors = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  async onSubmit(form: NgForm) {
    try {
      const deviceData = {
        device_id: form.value['device_id'],
        device_name: form.value['device_name'],
        // image_path: form.value['image_path'],
        device_status: this.isOn ? 'online' : 'offline'
      }
      const sendData = await this.restService.submitEndDevice(deviceData);
      console.log("on-submit response " + sendData);
      form.reset();
      this.loadSensorData()
    } catch (error) {
      console.log("error on-submit " + error)
    }
  }

  showDeleteModal(id: number) {
    console.log("Delete sensor " + id);
    this.sensorId = id;
    this.modalDeleteON = true
  }

  closeDeleteModal() {
    this.sensorId = null;
    this.modalDeleteON = false
  }

  deleteSensor() {
    if (this.sensorId === null) return;

    this.restService.deleteEndDevice(this.sensorId).subscribe({
      next: () => {
        console.log(`Sensor ${this.sensorId} deleted`);
        this.closeDeleteModal();
        this.loadSensorData();
      },
      error: err => {
        console.error('Delete failed:', err);
      }
    });
  }

  toggleForm() {
     if (!this.authService.isAuthenticated()) {
      this.openLoginModal();
    }
    this.formON = !this.formON;
  }

  getStatusClass(status: string): string {
    return status === 'online' ? 'status-online' : 'status-offline';
  }

  editSensor(device_id: string) {
    // Open form or modal with sensor data
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
