import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

export interface BrokerData {
  device_name: string
  url_path: string
  status: string
}

export interface EndDeviceData {
  device_id:string,
  device_name: string,
  device_status: string,
  // image_path: string
}

export interface VehicleData {
  name: string,
  image_path: string
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

  fetchDataDevice(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}endall/`);
  }

  fetchDataByDeviceId(deviceId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}detail_sensor/`, {
      params: { sensor_id: deviceId }
    });
  }

  async submitEndDevice(endDevice: EndDeviceData): Promise<string> {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token:', token);
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      });

      const response = await firstValueFrom(this.http.post(`${this.apiUrl}create_device/`, endDevice, { headers }));
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


  async updateEndDevice(endDevice: EndDeviceData): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      });
      const response = await firstValueFrom(this.http.put(`${this.apiUrl}update_device/`, endDevice, { headers }))
      console.log('response ' + response)
    } catch (error) {
      console.log("error update broker " + error)
    }
  }

  fetchBrokerConnection(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}read_broker/`)
  }

  async submitBroker(brokerData: BrokerData): Promise<string> {
    try {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      });
      const response = await firstValueFrom(this.http.post(`${this.apiUrl}create_broker/`, brokerData, { headers }))
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

  async updateBroker(brokerData: BrokerData): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      });
      const response = await firstValueFrom(this.http.put(`${this.apiUrl}update_broker/`, brokerData, { headers }))
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

  async updateVehicle(vehicleData: VehicleData): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      });
      const response = await firstValueFrom(this.http.put(`${this.apiUrl}update_vehicle/`, vehicleData, { headers }))
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