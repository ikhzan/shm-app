import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestService } from '../../services/rest.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sensor-detail',
  imports: [NgFor, DatePipe, FormsModule, FontAwesomeModule, NgIf],
  providers: [DatePipe],
  templateUrl: './sensor-detail.component.html',
  styleUrl: './sensor-detail.component.scss'
})
export class SensorDetailComponent implements OnInit {
  faSearch = faSearch
  deviceId = '';
  sensorData: any[] = []
  isLoading: boolean = false;
  searchTerm = '';
  pageSize = 10;
  currentPage = 1;
  Math = Math
  allSensors: any[] = [];
  dataSensor: any[] = [];
  filteredCount = 0;
  sortDirection: 'asc' | 'desc' = 'asc';
  sortColumn: string = 'timestamp';

  constructor(private route: ActivatedRoute,
    private restService: RestService,
    private datePipe: DatePipe
  ) {

  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadSensorData()
  }

  private loadSensorData(): void {
    this.deviceId = this.route.snapshot.paramMap.get('id')!;

    this.restService.fetchDataByDeviceId(this.deviceId).subscribe({
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

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();

    let filtered = this.allSensors.filter(b => {
      const formatted = this.datePipe.transform(b.timestamp, 'medium')?.toLowerCase();
      return formatted?.includes(term);
    });

    filtered = filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return this.sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
    });

    this.filteredCount = filtered.length;
    const totalPages = Math.ceil(this.filteredCount / this.pageSize);
    this.currentPage = Math.min(this.currentPage, totalPages || 1);

    const start = (this.currentPage - 1) * this.pageSize;
    this.dataSensor = filtered.slice(start, start + this.pageSize);
  }

  toggleSort(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
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
    const totalPages = Math.ceil(this.filteredCount / this.pageSize);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCount / this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }


  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
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

  getTempIcon(temp: number | null | undefined): string {
    if (temp == null) return '❓'; // Unknown
    if (temp >= 35) return '🔥';  // Extreme heat
    if (temp >= 30) return '☀️';  // Hot
    if (temp >= 23) return '🌤️'; // Warm
    if (temp >= 15) return '🌥️'; // Mild
    if (temp >= 5) return '🌧️'; // Cool
    return '❄️';                 // Cold
  }
}
