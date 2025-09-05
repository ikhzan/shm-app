import { Routes } from '@angular/router';
import { HomeComponent } from './main/home/home.component';
import { BrokersComponent } from './main/brokers/brokers.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { ChatComponent } from './main/chat/chat.component';
import { DatasetComponent } from './main/dataset/dataset.component';
import { SensorComponent } from './main/sensors/sensor/sensor.component';
import { MainComponent } from './main/main.component';
import { SensorDetailComponent } from './main/sensors/sensor-detail/sensor-detail.component';
import { SensorsComponent } from './main/sensors/sensors.component';
import { VehicleDetailComponent } from './main/vehicles/vehicle-detail/vehicle-detail.component';
import { VehicleComponent } from './main/vehicles/vehicle/vehicle.component';
import { VehiclesComponent } from './main/vehicles/vehicles.component';

export const routes: Routes = [
    {
        path: '', component: MainComponent, children: [
            { path: '', component: HomeComponent },
            {
                path: 'sensors', component: SensorsComponent, children: [
                    { path: '', component: SensorComponent },
                    { path: ':id', component: SensorDetailComponent },
                ]
            },
            {
                path: 'vehicles', component: VehiclesComponent, children: [
                    { path: '', component: VehicleComponent },
                    { path: ':id', component: VehicleDetailComponent }
                ]
            },
            { path: 'brokers', component: BrokersComponent },
            { path: 'chat', component: ChatComponent },
            { path: 'dataset', component: DatasetComponent },
        ]
    },
    { path: '**', component: NotfoundComponent }
];
