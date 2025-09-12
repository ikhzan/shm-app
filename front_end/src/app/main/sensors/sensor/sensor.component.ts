import { Component, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt, faClose, faSearch, faTrashCan, faEdit } from '@fortawesome/free-solid-svg-icons';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RestService } from '../../../services/rest.service';
import { AuthService } from '../../../services/auth.service';
import { DeleteDataModalComponent } from '../../../shared/delete-data-modal/delete-data-modal.component';
import { LoginModalComponent } from '../../../shared/login-modal/login-modal.component';
import { RouterLink } from '@angular/router';
import { MediaService } from '../../../services/media.service';
import { LoadingSpinnerService } from '../../../shared/loading-spinner/loading-spinner.service';
import { FileHelper } from '../../utils/file-helper';

export interface Credentials {
  username: string
  password: string
}

@Component({
  selector: 'app-sensor',
  imports: [FontAwesomeModule, ReactiveFormsModule, RouterLink, NgFor, NgIf, NgClass, FormsModule, DeleteDataModalComponent, LoginModalComponent],
  templateUrl: './sensor.component.html',
  styleUrl: './sensor.component.scss'
})
export class SensorComponent implements OnInit {
  faSearch = faSearch
  faTrash = faTrashAlt
  faClose = faClose
  faTrashCan = faTrashCan
  faEdit = faEdit
  modalDeleteON = false
  allSensors: any[] = [];
  dataSensor: any[] = [];
  unattachedBrokers: any[] = [];
  selectedBrokerId: number | null = null;
  searchTerm = '';
  pageSize = 10;
  currentPage = 1;
  Math = Math
  formON: boolean = false;
  sensorId: number | null = null;
  isAuthenticated = false;
  loginModalON = false;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  loadingLora: string | null = "Load Lora"
  endDevices: any[] = [];
  deviceForm!: FormGroup
  endDevicesData: any[] = [];
  isEditMode = false;
  @ViewChild(LoginModalComponent) loginModal!: LoginModalComponent;

  constructor(private fb: FormBuilder,
    private restService: RestService,
    private authService: AuthService,
    private mediaService: MediaService,
    private loadingService: LoadingSpinnerService) { }


  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadSensorData();
    this.initForm();
  }

  initForm(): void {
    this.deviceForm = this.fb.group({
      device_id: ['', Validators.required],
      device_name: ['', Validators.required],
      dev_eui: [''],
      join_eui: [''],
      position_x: [0.0, Validators.required],
      position_y: [0.0, Validators.required],
      broker_id: [null],
    });
  }

  private loadSensorData(): void {
    this.loadingService.show();
    this.restService.fetchDataDevice().subscribe({
      next: (data) => {
        this.allSensors = data.end_devices;
        this.unattachedBrokers = data.unattached_brokers;
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
      }
    });
  }

  private loadDataLoraDevices() {
    this.restService.fetchLoraDevices().subscribe({
      next: (data) => {
        console.log(`Data Lora Devices ${data}`)
        this.loadingLora = "Load Lora"
        this.endDevices = data.end_devices;
        this.loadSensorData();
      },
      error: (e) => {
        this.loadingLora = 'Error'
        console.log(`Error fetch data lora ${e}`)
        this.loadingLora = "Load Lora"
      }
    })
  }

  onBrokerChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedBrokerId = Number(select.value);
  }

  async onSubmit(): Promise<void> {
    if (this.deviceForm.invalid) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      this.loadingService.show();
      const formValue = this.deviceForm.getRawValue(); // includes disabled fields
      const formData = new FormData();

      formData.append('device_id', formValue.device_id);
      formData.append('device_name', formValue.device_name);
      formData.append('device_status', formValue.broker_id ? 'online' : 'offline');
      formData.append('dev_eui', formValue.dev_eui ?? '');
      formData.append('join_eui', formValue.join_eui ?? '');
      formData.append('position_x', String(formValue.position_x));
      formData.append('position_y', String(formValue.position_y));
      formData.append('broker_id', String(formValue.broker_id));

      console.log(`onsubmit broker_id: ${String(formValue.broker_id)}`)

      if (this.selectedFile) {
        formData.append('image_path', this.selectedFile);
        console.log(`File Image ${this.selectedFile}`)
      }

      let response;
      if (this.isEditMode) {
        response = await this.restService.updateEndDevice(formValue.device_id, formData);
        console.log('Edit response:', response);
      } else {
        response = await this.restService.submitEndDevice(formData);
        console.log('Create response:', response);
      }

      this.deviceForm.reset();
      this.selectedFile = null;
      this.imagePreview = null;
      this.isEditMode = false;
      this.loadingService.hide();
      this.loadSensorData()
    } catch (error) {
      console.error('Error during submit:', error);
      this.loadingService.hide();
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
    if (!this.isAuthenticated) {
      this.openLoginModal();
    } else {
      this.formON = !this.formON;
    }
  }

  loadLora() {
    if (!this.isAuthenticated) {
      this.openLoginModal();
    } else {
      console.log('user is authenticated and loading data..')
      this.loadingLora = 'loading...'
      this.loadDataLoraDevices();
    }
  }

  getStatusClass(status: string): string {
    return status === 'online' ? 'status-online' : 'status-offline';
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      if (!FileHelper.isSafeImage(this.selectedFile)) {
        alert('Invalid file type or suspicious content.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  editSensor(device_id: string) {
    if (!this.authService.isAuthenticated()) {
      this.openLoginModal();
    } else {
      this.formON = true;
      this.loadDeviceDataToForm(device_id);
    }
  }

  loadDeviceDataToForm(device_id: string): void {
    this.isEditMode = true;
    this.restService.fetchDataEditForm(device_id).subscribe({
      next: (data) => {
        const endDevice = Array.isArray(data.device) ? data.device[0] : data.device;
        if (!endDevice) return;

        this.unattachedBrokers = data.brokers;

        console.log(`UnattachedBrokers ${this.unattachedBrokers}`)
        this.deviceForm.patchValue({
          device_id: endDevice.device_id,
          device_name: endDevice.device_name,
          dev_eui: endDevice.dev_eui,
          join_eui: endDevice.join_eui,
          position_x: endDevice.position_x,
          position_y: endDevice.position_y,
          broker_id: endDevice.broker?.id,
        });
        console.log(`broker_id ${endDevice.broker?.id}`)
        this.imagePreview = this.getImage(endDevice.image_path) ?? null;
      },
      error: (err) => {
        console.error('Error loading device data:', err);
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
        this.isAuthenticated = true;
        this.closeLoginModal();
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.loginModal.showError('Invalid username or password.');
      }
    });
  }

  getImage(path: string): string {
    return this.mediaService.getImageUrl(path);
  }

}
