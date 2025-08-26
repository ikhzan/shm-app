import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt, faClose, faSearch } from '@fortawesome/free-solid-svg-icons';
import { NgFor, NgIf } from '@angular/common';
import { RestService } from '../../services/rest.service';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-brokers',
  imports: [NgFor, FontAwesomeModule, NgIf, FormsModule],
  templateUrl: './brokers.component.html',
  styleUrl: './brokers.component.scss'
})
export class BrokersComponent implements OnInit {
  faSearch = faSearch
  faTrash = faTrashAlt
  faClose = faClose
  modalDeleteON = true
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

  constructor(private restService: RestService, private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
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

  async onSubmit(form: NgForm){
    try{
      const brokerData = {
        device_name: form.value['device_name'],
        url_path: form.value['url_path'],
        status: this.isOn ? 'online' : 'offline'
      }
      const sendData = await this.restService.submitBroker(brokerData);
      console.log("on-submit response " + sendData);
      form.reset();
      this.loadBrokerData()
    }catch(error){
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
    this.modalDeleteON = false
  }

  closeDeleteModal() {
     this.brokerId = null;
    this.modalDeleteON = true
  }

  deleteFile() {
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

  toggleForm() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.formON = !this.formON;
  }
}
