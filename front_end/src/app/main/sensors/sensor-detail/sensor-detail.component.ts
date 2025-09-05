import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { RestService } from '../../../services/rest.service';
import { ChartHelper } from '../../utils/chart-helper';

@Component({
  selector: 'app-sensor-detail',
  imports: [NgFor, DatePipe, FormsModule, FontAwesomeModule, NgIf],
  providers: [DatePipe],
  templateUrl: './sensor-detail.component.html',
  styleUrl: './sensor-detail.component.scss'
})
export class SensorDetailComponent implements OnInit, AfterViewInit {
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
  endDevice: any[] = [];
  filteredCount = 0;
  sortDirection: 'asc' | 'desc' = 'asc';
  sortColumn: string = 'timestamp';
  uniqueDeviceIds: string[] = [];
  humiditySeriesByDevice: { [deviceId: string]: { timestamp: string; value: number }[] } = {};
  temperatureSeriesByDevice: { [deviceId: string]: { timestamp: string; value: number }[] } = {};
  @ViewChildren('humidityCanvas') humidityCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('temperatureCanvas') temperatureCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  humidityDeviceIds: string[] = [];
  temperatureDeviceIds: string[] = [];

  constructor(private route: ActivatedRoute,
    private restService: RestService,
    private datePipe: DatePipe
  ) {

  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadSensorData()
  }

  ngAfterViewInit(): void {
    // Subscribe to changes in humidity canvases
    this.humidityCanvases.changes.subscribe(() => {
      this.renderHumidityCharts();
    });
    // Subscribe to changes in temperature canvases
    this.temperatureCanvases.changes.subscribe(() => {
      this.renderTemperatureCharts();
    });
  }

  private loadSensorData(): void {
    this.deviceId = this.route.snapshot.paramMap.get('id')!;

    this.restService.fetchDataByDeviceId(this.deviceId).subscribe({
      next: (data) => {
        this.allSensors = data.sensor_data;
        this.endDevice = data.end_devices;
        console.log("End-device " + data.end_devices)

        this.loadHumidityData(data.sensor_data);
        this.loadTemperatureData(data.sensor_data);


        this.applyFilters();
        this.isLoading = false;

        setTimeout(() => {
          this.renderHumidityCharts();
          this.renderTemperatureCharts();
        }, 0);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private loadHumidityData(sensorData: any[]): void {
    this.humiditySeriesByDevice = this.groupHumidityByDevice(sensorData);
    this.humidityDeviceIds = Object.keys(this.humiditySeriesByDevice);
  }

  private loadTemperatureData(sensorData: any[]): void {
    this.temperatureSeriesByDevice = this.groupTemperatureByDevice(sensorData);
    this.temperatureDeviceIds = Object.keys(this.temperatureSeriesByDevice);
  }

  private renderHumidityCharts(): void {
    this.humidityCanvases.forEach((canvasRef, index) => {
      const deviceId = this.humidityDeviceIds[index];
      const humidityData = this.humiditySeriesByDevice[deviceId] || [];
      const ctx = canvasRef.nativeElement.getContext('2d');
      if (ctx && humidityData.length > 0) {
        ChartHelper.renderHumidityChart(ctx, humidityData, `Humidity - ${deviceId}`);
      }
    });
  }

  private renderTemperatureCharts(): void {
    this.temperatureCanvases.forEach((canvasRef, index) => {
      const deviceId = this.temperatureDeviceIds[index];
      const temperatureData = this.temperatureSeriesByDevice[deviceId] || [];
      const ctx = canvasRef.nativeElement.getContext('2d');
      if (ctx && temperatureData.length > 0) {
        ChartHelper.renderTemperatureChart(ctx, temperatureData, `Temperature - ${deviceId}`);
      }
    });
  }

  private groupHumidityByDevice(data: any[]): { [deviceId: string]: { timestamp: string; value: number }[] } {
    const grouped: Record<string, { timestamp: string; value: number }[]> = {};
    for (const r of data) {
      const id = r.device_id;
      const humidity = r.sensor_data?.Hum_SHT;
      if (humidity !== undefined) {
        if (!grouped[id]) grouped[id] = [];
        grouped[id].push({ timestamp: r.timestamp, value: humidity });
      }
    }
    return grouped;
  }

  private groupTemperatureByDevice(data: any[]): { [deviceId: string]: { timestamp: string; value: number }[] } {
    const grouped: Record<string, { timestamp: string; value: number }[]> = {};
    for (const r of data) {
      const id = r.device_id;
      const temperature = r.sensor_data?.TempC_SHT;
      if (temperature !== undefined) {
        if (!grouped[id]) grouped[id] = [];
        grouped[id].push({ timestamp: r.timestamp, value: temperature });
      }
    }
    return grouped;
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
