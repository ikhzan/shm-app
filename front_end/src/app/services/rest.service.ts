import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

export interface BrokerData {
  device_name: string
  url_path: string
  status: string
}

export interface EndDeviceData {
  device_id: string,
  device_name: string,
  device_status: string,
  // image_path: string
}

export interface VehicleData {
  name: string,
  image_path: string
}

export interface EndDevice {
  id: number;
  device_name: string;
  position_x: number;
  position_y: number;
  value: number;
  device_status: string;
}

export interface Vehicle {
  id: number;
  name: string;
  image_path: string;
  end_devices: EndDevice[];
}

export interface GatewayData {
  name: string,
  url_path: string
}

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) { }

  fetchDataSensor(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}all/`);
  }

  fetchDataDevice(): Observable<{ end_devices: any[]; unattached_brokers: any[] }> {
    return this.http.get<{ end_devices: any[]; unattached_brokers: any[] }>(`${this.apiUrl}all_enddevice/`);
  }

  fetchDataByDeviceId(deviceId: string): Observable<{ end_devices: any[]; sensor_data: any[] }> {
    return this.http.get<{ end_devices: any[]; sensor_data: any[] }>(`${this.apiUrl}detail_sensor/`, {
      params: { sensor_id: deviceId }
    });
  }

  fetchDataEditForm(deviceId: string): Observable<{ device: any[]; brokers: any[] }> {
    return this.http.get<{ device: any[]; brokers: any[] }>(`${this.apiUrl}edit_sensor/`, {
      params: { sensor_id: deviceId }
    });
  }

  fetchDataByVehicleId(vehicleId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}detail_vehicle/`, {
      params: { id: vehicleId }
    });
  }

  fetchLoraDevices(): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.get<any>(`${this.apiUrl}lora/devices/`, {
      headers: { Authorization: 'Bearer ' + token }
    });
  }

  fetchLoraApp(): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.get<any>(`${this.apiUrl}lora/apps/`, {
      headers: { Authorization: 'Bearer ' + token }
    });
  }

  fetchLinkedDevices(): Observable<{ vehicles: Vehicle[] }> {
    return this.http.get<{ vehicles: Vehicle[] }>(`${this.apiUrl}linked_devices/`);
  }

  async submitEndDevice(data: FormData): Promise<string> {
    try {
      const token = localStorage.getItem('access_token');

      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token
      });
      console.log('new-end-device:', data);
      const response = await firstValueFrom(this.http.post(`${this.apiUrl}create_device/`, data, { headers }));
      console.log("response " + response);
      return response.toString();
    } catch (error) {
      console.log("Error submit End Device" + error)
      throw "error sending data"
    }
  }

  deleteEndDevice(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    });

    return this.http.delete(`${this.apiUrl}delete_device/`, {
      headers,
      params: { id }
    });
  }


  async updateEndDevice(device_id: string, data: FormData): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token
      });
      const response = await firstValueFrom(this.http.put(`${this.apiUrl}update_device/${device_id}/`, data, { headers }))
      console.log('response ' + response)
    } catch (error) {
      console.log("error update broker " + error)
    }
  }

  fetchBrokerConnection(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}read_broker/`)
  }

  async submitBroker(data: FormData): Promise<string> {
    try {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token
      });
      const response = await firstValueFrom(this.http.post(`${this.apiUrl}create_broker/`, data, { headers }))
      console.log('response ' + response)
      return response.toString();
    } catch (error) {
      throw 'Error submit databroker'
    }
  }

  deleteBroker(id: number): Observable<any> {
    try {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      });
      return this.http.delete(`${this.apiUrl}delete_broker/`, { headers, params: { id } });
    } catch (error) {
      throw 'Error delete broker'
    }
  }

  async updateBroker(broker_id: number, data: FormData): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token
      });
      const response = await firstValueFrom(this.http.put(`${this.apiUrl}update_broker/`, data, { headers, params: { id: broker_id } }))
      console.log('response ' + response)
    } catch (error) {
      console.log("error update broker " + error)
    }
  }

  fetchVehicle(): Observable<{ vehicles: any[]; unlinked_sensors: any[] }> {
    return this.http.get<{ vehicles: any[]; unlinked_sensors: any[] }>(`${this.apiUrl}all_vehicle/`);
  }

  async newVehicle(data: FormData): Promise<string> {
    try {
      const token = localStorage.getItem('access_token');

      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        // 'Content-Type': 'multipart/form-data'
      });

      const response = await firstValueFrom(this.http.post(`${this.apiUrl}create_vehicle/`, data, { headers }));
      console.log("response " + response);
      return response.toString();
    } catch (error) {
      console.log("Error submit Vehicle" + error)
      throw "error sending data"
    }
  }

  async updateVehicle(vehicle_id: number, data: FormData): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token
      });
      const response = await firstValueFrom(this.http.put(`${this.apiUrl}update_vehicle/`, data, { headers, params: { id: vehicle_id } }))
      console.log('response ' + response)
    } catch (error) {
      console.log("error update broker " + error)
    }
  }

  deleteVehicle(id: number): Observable<any> {
    try {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      });
      return this.http.delete(`${this.apiUrl}delete_vehicle/`, { headers, params: { id } });
    } catch (error) {
      throw 'Error delete vehicle'
    }
  }

  fetchLoraGateway(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}all_gateway/`);
  }

  async newGateway(endDevice: GatewayData): Promise<string> {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token:', token);
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      });

      const response = await firstValueFrom(this.http.post(`${this.apiUrl}create_gateway/`, endDevice, { headers }));
      console.log("response " + response);
      return response.toString();
    } catch (error) {
      console.log("Error submit Gateway" + error)
      throw "error sending data"
    }
  }

  async updateGateway(gatewayData: GatewayData): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      });
      const response = await firstValueFrom(this.http.put(`${this.apiUrl}update_gateway/`, gatewayData, { headers }))
      console.log('response ' + response)
    } catch (error) {
      console.log("error update broker " + error)
    }
  }

  deleteGateway(id: number): Observable<any> {
    try {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      });
      return this.http.delete(`${this.apiUrl}delete_gateway/`, { headers, params: { id } });
    } catch (error) {
      throw 'Error delete vehicle'
    }
  }

}