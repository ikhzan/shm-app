import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Sensor } from './sensor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt, faClose, faSearch } from '@fortawesome/free-solid-svg-icons';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { RestService } from '../../services/rest.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sensor',
  imports: [FontAwesomeModule, NgFor, NgIf, FormsModule],
  templateUrl: './sensor.component.html',
  styleUrl: './sensor.component.scss'
})
export class SensorComponent implements OnInit {
  faSearch = faSearch
  faTrash = faTrashAlt
  faClose = faClose
  modalDeleteON = true
  sensors: Sensor[] = [
    { id: 1, name: 'Temperature Sensor', data: 'Thermocouple', time: new Date('2024-06-01T10:00:00') },
    { id: 2, name: 'Pressure Sensor', data: 'Piezoelectric', time: new Date('2024-06-01T11:00:00') },
    { id: 3, name: 'Humidity Sensor', data: 'Capacitive', time: new Date('2024-06-01T12:00:00') }
  ];
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

  constructor(private restService: RestService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loadSensorData()
  }

  private loadSensorData(): void {
    this.isLoading = true;
    this.restService.fetchDataDevice().subscribe({
      next: (data) => {
        this.allSensors = data;
        this.applyFilters();
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
        device_name: form.value['device_name'],
        image_path: form.value['image_path'],
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

  applyFilters(): void {
    const filtered = this.allSensors.filter(b =>
      b.device_name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    const start = (this.currentPage - 1) * this.pageSize;
    this.dataSensor = filtered.slice(start, start + this.pageSize);
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
        this.loadSensorData();
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
