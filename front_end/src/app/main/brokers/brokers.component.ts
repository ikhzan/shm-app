import { Component, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt, faClose, faSearch, faEdit } from '@fortawesome/free-solid-svg-icons';
import { NgFor, NgIf } from '@angular/common';
import { RestService } from '../../services/rest.service';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DeleteDataModalComponent } from '../../shared/delete-data-modal/delete-data-modal.component';
import { LoginModalComponent } from "../../shared/login-modal/login-modal.component";

export interface Credentials {
  username: string
  password: string
}

@Component({
  selector: 'app-brokers',
  imports: [NgFor, FontAwesomeModule, NgIf, FormsModule, DeleteDataModalComponent, LoginModalComponent],
  templateUrl: './brokers.component.html',
  styleUrl: './brokers.component.scss'
})
export class BrokersComponent implements OnInit {
  faSearch = faSearch
  faTrash = faTrashAlt
  faClose = faClose
  faEdit = faEdit
  modalDeleteON = false
  isOn = false;
  formON: boolean = false;
  Math = Math;
  allBrokers: any[] = [];
  dataBroker: any[] = [];
  isLoading: boolean = false;
  searchTerm = '';
  pageSize = 10;
  currentPage = 1;
  brokerId: number | null = null;
  isAuthenticated = false;
  loginModalON = false;
  endDevices: any[] = [];
  loadingLora: string | null = "Load Lora"
  @ViewChild(LoginModalComponent) loginModal!: LoginModalComponent;

  constructor(private restService: RestService,
    private authService: AuthService) {
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadBrokerData()
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

  async onSubmit(form: NgForm) {
    try {
      const brokerData = {
        device_name: form.value['device_name'],
        url_path: form.value['url_path'],
        status: this.isOn ? 'online' : 'offline'
      }
      const sendData = await this.restService.submitBroker(brokerData);
      console.log("on-submit response " + sendData);
      form.reset();
      this.loadBrokerData()
    } catch (error) {
      console.log("error on-submit " + error)
    }
  }

  applyFilters(): void {
    const filtered = this.allBrokers.filter(b =>
      b.device_name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    const start = (this.currentPage - 1) * this.pageSize;
    this.dataBroker = filtered.slice(start, start + this.pageSize);
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
    this.brokerId = null;
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

  editBroker(){
    
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
