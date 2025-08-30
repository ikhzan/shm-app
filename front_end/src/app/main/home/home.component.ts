import { Component, OnInit } from '@angular/core';
import { BrokerService } from '../../services/broker.service';
import { NgFor, NgIf, DatePipe, NgClass } from '@angular/common';
import { RestService } from '../../services/rest.service';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';

interface Sensor {
  x: number; // left %
  y: number; // top %
  icon: string;
  name: string;
  value: number;
  status: string;
}

@Component({
  selector: 'app-home',
  imports: [NgClass, NgFor, NgIf, DatePipe, FormsModule, FontAwesomeModule, RouterLink],
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
  shipHull = 'assets/ships/ship-hull.gif'
  sukhoi = 'assets/ships/sukhoi-su-35.gif'
  chs6 = 'assets/ships/chs6.gif'
  chinook = 'assets/ships/chnook.png'
  sensors: Sensor[] = [];
  isReconnecting = false;
  reconnectStatus = "Retry";

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

  reconnectService() {
    this.reconnectStatus = 'Reconnecting...';
    console.log("reconnectiong...")
    this.brokerService.reconnectStatus$.subscribe({
      next: status => {
        this.reconnectStatus = status;

        // Reset only when reconnect is complete or failed
        if (status === 'Connected' || status === 'Failed') {
          this.isReconnecting = false;
        }
      },
      error: () => {
        this.reconnectStatus = 'Failed — Retry';
        this.isReconnecting = false;
      }
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
      return 'emergency';
    } else if (value > 80) {
      return 'critical';
    } else if (value > 60) {
      return 'elevated';
    } else {
      return 'safe';
    }
  }

  getLampClass(value: number): string {
    if (value < 50) return 'lamp-green';
    if (value < 70) return 'lamp-yellow';
    return 'lamp-red';
  }

  placeSensor(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const sensor: Sensor = {
      x: parseFloat(x.toFixed(2)),
      y: parseFloat(y.toFixed(2)),
      icon: '📍',
      name: `Sensor ${this.sensors.length + 1}`,
      value: 40,
      status: 'unknown'
    };

    this.sensors.push(sensor);
    console.log(`Placed at x: ${sensor.x}%, y: ${sensor.y}%`);
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
