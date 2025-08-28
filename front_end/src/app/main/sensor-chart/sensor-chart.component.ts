import {
  Component,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
  OnInit
} from '@angular/core';
import { RestService } from '../../services/rest.service';
import { ChartHelper } from '../utils/chart-helper';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

interface Sensor {
  x: number; // left %
  y: number; // top %
  icon: string;
  name: string;
  value: number;
  status: string;
}


@Component({
  selector: 'app-sensor-chart',
  imports: [NgIf, NgFor],
  templateUrl: './sensor-chart.component.html',
  styleUrls: ['./sensor-chart.component.scss']
})
export class SensorChartComponent implements OnInit {
  allSensors: any[] = [];
  humiditySeriesByDevice: { [deviceId: string]: { timestamp: string; value: number }[] } = {};
  tempSeriesByDevice: { [deviceId: string]: { timestamp: string; value: number }[] } = {};
  uniqueDeviceIds: string[] = [];
  isLoading = false;
  shipHull = 'assets/ships/ship-hull.gif'
  sensors: Sensor[] = [];

  // sensors = [
  //   { x: 20, y: 30, icon: '🌡️', status: 'safe', value: 50, name: 'Temperature' },       // Temperature sensor
  //   { x: 50, y: 60, icon: '📈', status: 'warning', value: 70, name: 'Fatigue' },    // Fatigue sensor
  //   { x: 75, y: 20, icon: '🛠️', status: 'critical', value: 90, name: 'Vibration' },   // Vibration sensor
  // ];


  @ViewChildren('chartCanvas') chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('humidityCanvas') humidityCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('temperatureCanvas') temperatureCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  constructor(private restService: RestService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadSensorData();
  }

  ngAfterViewInit(): void {
    this.loadSensorData();
  }

  private loadSensorData(): void {
    this.isLoading = true;

    this.restService.fetchDataSensor().subscribe({
      next: (data) => {
        this.allSensors = data;
        this.humiditySeriesByDevice = this.groupHumidityByDevice(data);
        this.uniqueDeviceIds = Object.keys(this.humiditySeriesByDevice);
        this.isLoading = false;

        // Wait for view to update before rendering charts
        setTimeout(() => this.renderCharts(), 0);
      },
      error: (err) => {
        console.error('Failed to fetch sensor data:', err);
        this.isLoading = false;
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
      const temp = r.sensor_data?.TempC_SHT;
      if (temp !== undefined) {
        if (!grouped[id]) grouped[id] = [];
        grouped[id].push({ timestamp: r.timestamp, value: temp });
      }
    }

    return grouped;
  }


  private renderCharts(): void {
    this.chartCanvases.forEach((canvasRef, index) => {
      const deviceId = this.uniqueDeviceIds[index];
      const humidityData = this.humiditySeriesByDevice[deviceId];
      const temperatureData = this.humiditySeriesByDevice[deviceId];
      const ctx = canvasRef.nativeElement.getContext('2d');
      if (ctx && humidityData.length > 0) {
        ChartHelper.renderHumidityChart(ctx, humidityData, `Humidity - ${deviceId}`);
        ChartHelper.renderTemperatureChart(ctx, temperatureData, `Temperature - ${deviceId}`);
      }
    });
  }

  getLampClass(value: number): string {
    if (value < 50) return 'lamp-green';
    if (value < 70) return 'lamp-yellow';
    return 'lamp-red';
  }

  // placeSensor(event: MouseEvent) {
  //   const rect = (event.target as HTMLElement).getBoundingClientRect();
  //   const x = ((event.clientX - rect.left) / rect.width) * 100;
  //   const y = ((event.clientY - rect.top) / rect.height) * 100;

  //   this.sensors.push({
  //     x,
  //     y,
  //     name: 'New Sensor',
  //     value: 0,
  //     icon: '❓',
  //     status: 'unknown'
  //   });
  // }


  placeSensor(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const sensor: Sensor = {
      x: parseFloat(x.toFixed(2)),
      y: parseFloat(y.toFixed(2)),
      icon: '📍',
      name: `Sensor ${this.sensors.length + 1}`,
      value: 0,
      status: 'unknown'
    };

    this.sensors.push(sensor);
    console.log(`Placed at x: ${sensor.x}%, y: ${sensor.y}%`);
  }



  getSensorDefaults(type: string): { icon: string; status: string } {
    switch (type.toLowerCase()) {
      case 'temperature':
        return { icon: '🌡️', status: 'safe' };
      case 'fatigue':
        return { icon: '📈', status: 'warning' };
      case 'vibration':
        return { icon: '🛠️', status: 'critical' };
      default:
        return { icon: '❓', status: 'unknown' };
    }
  }



}