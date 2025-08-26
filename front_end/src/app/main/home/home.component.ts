import { Component, OnInit } from '@angular/core';
import { BrokerService } from '../../services/broker.service';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { RestService } from '../../services/rest.service';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt, faClose, faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  imports: [NgFor, NgIf, DatePipe, FormsModule, FontAwesomeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  faSearch = faSearch;
  messages: any[] = [];
  status: string = "unknown";
  dataSensor: any[] = [];
  displayedColumns: string[] = ['device_id', 'timestamp', 'battery', 'temperature', 'humidity', 'location'];
  Math = Math;
  allSensors: any[] = [];
  isLoading: boolean = false;
  searchTerm = '';
  pageSize = 10;
  currentPage = 1;

  constructor(private brokerService: BrokerService, private restService: RestService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadSensorData();

    // Refresh sensor data when a new message arrives
    this.brokerService.messages$.subscribe(message => {
      this.messages.unshift(message);
      this.loadSensorData();
    });

    // Update status reactively
    this.brokerService.status$.subscribe(status => {
      this.status = status;
    });
  }

  private loadSensorData(): void {
    this.restService.fetchDataSensor().subscribe({
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

  getRangeClass(value: number): string {
    if (value > 90) {
      return 'danger';
    } else if (value > 80) {
      return 'warning';
    } else if (value > 60) {
      return 'safe';
    } else {
      return 'low';
    }
  }

  applyFilters(): void {
    const filtered = this.allSensors.filter(b =>
      b.device_id.toLowerCase().includes(this.searchTerm.toLowerCase())
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


}
