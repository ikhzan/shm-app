import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { RestService } from '../../../services/rest.service';
import { ChartHelper } from '../../utils/chart-helper';
import { DynamicTableComponent, TableColumn } from "../../../shared/dynamic-table/dynamic-table.component";
import { LoadingSpinnerService } from '../../../shared/loading-spinner/loading-spinner.service';

@Component({
  selector: 'app-sensor-detail',
  imports: [NgFor, FormsModule, FontAwesomeModule, NgIf, DynamicTableComponent],
  providers: [DatePipe],
  templateUrl: './sensor-detail.component.html',
  styleUrl: './sensor-detail.component.scss'
})
export class SensorDetailComponent implements OnInit, AfterViewInit {
  faSearch = faSearch
  deviceId = '';
  sensorData: any[] = []
  isLoading: boolean = false;
  endDevice: any[] = [];
  uniqueDeviceIds: string[] = [];
  humidityDeviceIds: string[] = [];
  temperatureDeviceIds: string[] = [];
  humiditySeriesByDevice: { [deviceId: string]: { timestamp: string; value: number }[] } = {};
  temperatureSeriesByDevice: { [deviceId: string]: { timestamp: string; value: number }[] } = {};
  @ViewChildren('humidityCanvas') humidityCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('temperatureCanvas') temperatureCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  data: any[] = [];
  columns: TableColumn[] = [
    {
      label: 'id',
      path: 'id'
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

  constructor(private route: ActivatedRoute,
    private restService: RestService, private loadingService: LoadingSpinnerService) {

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
    this.loadingService.show();

    this.restService.fetchDataByDeviceId(this.deviceId).subscribe({
      next: (data) => {
        this.data = data.sensor_data;
        this.endDevice = data.end_devices;
        console.log("End-device " + data.end_devices)

        this.loadHumidityData(data.sensor_data);
        this.loadTemperatureData(data.sensor_data);

        this.isLoading = false;

        setTimeout(() => {
          this.renderHumidityCharts();
          this.renderTemperatureCharts();
        }, 0);

        this.loadingService.hide();
      },
      error: () => {
        this.isLoading = false;
        this.loadingService.hide();
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
