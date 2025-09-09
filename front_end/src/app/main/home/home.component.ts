import { Component, OnInit } from '@angular/core';
import { BrokerService } from '../../services/broker.service';
import { NgFor, NgIf, DatePipe, NgClass } from '@angular/common';
import { RestService } from '../../services/rest.service';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { DynamicTableComponent, TableColumn } from "../../shared/dynamic-table/dynamic-table.component";
import { MediaService } from '../../services/media.service';
import { LoadingSpinnerService } from '../../shared/loading-spinner/loading-spinner.service';

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
  imports: [NgClass, NgFor, NgIf, DatePipe, FormsModule, FontAwesomeModule, RouterLink, DynamicTableComponent],
  templateUrl: './home.component.html',
  providers: [DatePipe],
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  faSearch = faSearch;
  messages: any[] = [];
  status: string = "unknown";
  data: any[] = [];
  columns: TableColumn[] = [
    {
      label: 'Device ID',
      path: 'device_id',
      type: 'link',
      linkTo: (row: any) => ['/sensors', row.device_id]
    },
    {
      label: 'SHM',
      path: 'sensor_data.Hum_SHT',
      class: (val: any) => this.getRangeClass(val ?? 0)
    },
    {
      label: 'Humidity',
      path: 'sensor_data.Hum_SHT',
    },
    {
      label: 'Battery',
      path: 'sensor_data.BatV'
    },
    {
      label: 'Temperature',
      path: 'sensor_data.TempC_SHT',
      suffix: (val: any) => this.getTempIcon(val)
    },
    {
      label: 'Spreading Factor',
      path: 'raw_payload.settings.data_rate.lora.spreading_factor'
    },
    {
      label: 'RSSI',
      path: 'raw_payload.rx_metadata[0].rssi'
    },
    {
      label: 'Timestamp',
      path: 'timestamp',
      type: 'date',
      pipe: 'date',
      pipeArg: 'medium'
    }
  ];
  sensors: Sensor[] = [];
  isReconnecting = false;
  reconnectStatus = "Retry";
  vehicles: any[] = [];
  linkedSensors: any[] = [];

  constructor(private brokerService: BrokerService, 
    private restService: RestService, 
    private mediaService: MediaService, private loadingService: LoadingSpinnerService) {
  }

  ngOnInit(): void {
    this.loadSensorData();
    this.loadLinkedDevices();
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
    this.loadingService.show();
    this.restService.fetchDataSensor().subscribe({
      next: (data) => {
        this.data = data;
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
      }
    });
  }

  private loadLinkedDevices(): void {
    this.restService.fetchLinkedDevices().subscribe({
      next: (data) => {
        this.vehicles = data.vehicles;
        console.log(`Datavehicles ${this.vehicles}`)
      },
      error: (err) => {
        console.log(`Error loadLinkeddevices ${err}`)
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

  getTempIcon(temp: number | null | undefined): string {
    if (temp == null) return '❓'; // Unknown
    if (temp >= 35) return '🔥';  // Extreme heat
    if (temp >= 30) return '☀️';  // Hot
    if (temp >= 23) return '🌤️'; // Warm
    if (temp >= 15) return '🌥️'; // Mild
    if (temp >= 5) return '🌧️'; // Cool
    return '❄️';                 // Cold
  }

  getImageUrl(imagePath: string): string {
    return this.mediaService.getImageUrl(imagePath); // Construct the full image URL
  }

}
