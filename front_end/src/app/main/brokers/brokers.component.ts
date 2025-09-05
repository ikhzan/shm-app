import { Component, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt, faClose, faSearch, faEdit } from '@fortawesome/free-solid-svg-icons';
import { NgFor, NgIf } from '@angular/common';
import { RestService } from '../../services/rest.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DeleteDataModalComponent } from '../../shared/delete-data-modal/delete-data-modal.component';
import { LoginModalComponent } from "../../shared/login-modal/login-modal.component";

export interface Credentials {
  username: string
  password: string
}

@Component({
  selector: 'app-brokers',
  imports: [ReactiveFormsModule, NgFor, FontAwesomeModule, NgIf, FormsModule, DeleteDataModalComponent, LoginModalComponent],
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
  Math = Math;
  allBrokers: any[] = [];
  dataBroker: any[] = [];
  isLoading: boolean = false;
  searchTerm = '';
  pageSize = 10;
  currentPage = 1;
  brokerId: number = 0;
  isAuthenticated = false;
  loginModalON = false;
  endDevices: any[] = [];
  loadingLora: string | null = "Load Lora"
  @ViewChild(LoginModalComponent) loginModal!: LoginModalComponent;
  brokerForm!: FormGroup
  isEditMode = false;

  constructor(private fb: FormBuilder, private restService: RestService,
    private authService: AuthService) {
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
    this.isLoading = true;
    this.restService.fetchBrokerConnection().subscribe({
      next: (data) => {
        this.allBrokers = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
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

  private loadDataLoraDevices() {
    this.restService.fetchLoraDevices().subscribe({
      next: (data) => {
        console.log(`Data Lora Devices ${data}`)
        this.loadingLora = "Load Lora"
        this.endDevices = data.end_devices;
      },
      error: (e) => {
        this.loadingLora = 'Error'
        console.log(`Error fetch data lora ${e}`)
        this.loadingLora = "Load Lora"
      }
    })
  }

  applyFilters(): void {
    const filtered = this.allBrokers.filter(b =>
      b.device_name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    const start = (this.currentPage - 1) * this.pageSize;
    this.dataBroker = filtered.slice(start, start + this.pageSize);
  }

  async onSubmit(): Promise<void> {
    if (this.brokerForm.invalid) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      this.isLoading = true;
      const formValue = this.brokerForm.getRawValue();
      const formData = new FormData();

      formData.append('device_name', formValue.device_name);
      formData.append('status', formValue.status ? 'online' : 'offline');
      formData.append('url_path', formValue.url_path ?? '');

      let response;
      if (this.isEditMode) {
        response = await this.restService.updateBroker(this.brokerId , formData);
        console.log('Edit response:', response);
      } else {
        response = await this.restService.submitBroker(formData);
        console.log('Create response:', response);
      }

      this.brokerForm.reset();
      this.isEditMode = false;
      this.isLoading = false;
      this.loadBrokerData();
    } catch (error) {
      console.error('Error during submit:', error);
      this.isLoading = false;
    }
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageSizeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.pageSize = +value;
    this.currentPage = 1;
    this.applyFilters();
  }

  nextPage(): void {
    this.currentPage++;
    this.applyFilters();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
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
    const broker = this.dataBroker.find(b => b.id === id);
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
    }else{
      console.log(`broker not found ${id}`)
    }
  }

  loadEditForm() {

  }

  loadLora() {
    if (!this.authService.isAuthenticated()) {
      this.openLoginModal();
    } else {
      console.log('user is authenticated and loading data..')
      this.loadingLora = 'loading...'
      this.loadDataLoraDevices();
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
