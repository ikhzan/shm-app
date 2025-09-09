import { Component, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt, faClose, faSearch, faEdit } from '@fortawesome/free-solid-svg-icons';
import { NgIf } from '@angular/common';
import { RestService } from '../../services/rest.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DeleteDataModalComponent } from '../../shared/delete-data-modal/delete-data-modal.component';
import { LoginModalComponent } from "../../shared/login-modal/login-modal.component";
import { DynamicTableComponent, TableColumn } from '../../shared/dynamic-table/dynamic-table.component';
import { LoadingSpinnerService } from '../../shared/loading-spinner/loading-spinner.service';

export interface Credentials {
  username: string
  password: string
}

@Component({
  selector: 'app-brokers',
  imports: [ReactiveFormsModule, FontAwesomeModule, NgIf, FormsModule, DeleteDataModalComponent, DynamicTableComponent, LoginModalComponent],
  templateUrl: './brokers.component.html',
  styleUrl: './brokers.component.scss'
})
export class BrokersComponent implements OnInit {
  faSearch = faSearch
  faTrash = faTrashAlt
  faClose = faClose
  faEdit = faEdit
  modalDeleteON = false
  formON: boolean = false;
  brokerId: number = 0;
  isAuthenticated = false;
  loginModalON = false;
  @ViewChild(LoginModalComponent) loginModal!: LoginModalComponent;
  brokerForm!: FormGroup
  isEditMode = false;
  paginatedData: any[] = [];
  columns: TableColumn[] = [
    {
      label: 'Name',
      path: 'device_name',
    },
    {
      label: 'Sensor Type',
      path: 'sensor_type'
    },

    {
      label: 'Status',
      path: 'status'
    },
    {
      label: 'URL',
      path: 'url_path'
    },
    {
      label: 'action',
      path: '',
      type: 'text',
      authRequired: true,
      customRender: 'actions'
    }
  ];

  constructor(private fb: FormBuilder, private restService: RestService,
    private authService: AuthService, private loadingService: LoadingSpinnerService) {
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadBrokerData();
    this.initForm();
  }

  get toggleSwitchValue(): boolean {
    return this.brokerForm.get('toggleSwitch')?.value;
  }

  get isOn(): boolean {
    return this.brokerForm.get('toggleSwitch')?.value;
  }

  private loadBrokerData(): void {
    this.loadingService.show();
    this.restService.fetchBrokerConnection().subscribe({
      next: (data) => {
        this.paginatedData = data;
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
      }
    });
  }

  initForm(): void {
    this.brokerForm = this.fb.group({
      device_name: ['', Validators.required],
      url_path: ['', Validators.required],
      sensor_type: ['', Validators.required],
      status: [false],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.brokerForm.invalid) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      this.loadingService.show();
      const formValue = this.brokerForm.getRawValue();
      const formData = new FormData();

      formData.append('device_name', formValue.device_name);
      formData.append('status', formValue.status ? 'online' : 'offline');
      formData.append('url_path', formValue.url_path ?? '');

      let response;
      if (this.isEditMode) {
        response = await this.restService.updateBroker(this.brokerId, formData);
        console.log('Edit response:', response);
      } else {
        response = await this.restService.submitBroker(formData);
        console.log('Create response:', response);
      }

      this.brokerForm.reset();
      this.isEditMode = false;
      this.loadingService.hide();
      this.loadBrokerData();
    } catch (error) {
      console.error('Error during submit:', error);
      this.loadingService.hide();
    }
  }

  showDeleteModal(id: number) {
    console.log("Delete broker " + id);
    this.brokerId = id;
    this.modalDeleteON = true
  }

  closeDeleteModal() {
    this.brokerId = 0;
    this.modalDeleteON = false
  }

  openDeleteModal() {
    this.modalDeleteON = true;
  }

  deleteBroker() {
    if (this.brokerId === null) return;

    this.restService.deleteBroker(this.brokerId).subscribe({
      next: () => {
        console.log(`broker ${this.brokerId} deleted`);
        this.closeDeleteModal();
        this.loadBrokerData();
      },
      error: err => {
        console.error('Delete failed:', err);
      }
    });
  }

  editBroker(id: number) {
    const broker = this.paginatedData.find(b => b.id === id);
    if (broker) {
      this.brokerId = id;
      this.formON = true;
      this.isEditMode = true;

      this.brokerForm.patchValue({
        broker_id: broker.id,
        device_name: broker.device_name,
        sensor_type: broker.sensor_type,
        status: broker.status,
        url_path: broker.url_path
      });
    } else {
      console.log(`broker not found ${id}`)
    }
  }

  toggleForm() {
    if (!this.authService.isAuthenticated()) {
      this.openLoginModal();
    }

    this.formON = !this.formON;
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
