import { Routes } from '@angular/router';
import { HomeComponent } from './main/home/home.component';
import { BrokersComponent } from './main/brokers/brokers.component';
import { NotfoundComponent } from './notfound/notfound.component';
// import { ChatComponent } from './main/chat/chat.component';
import { DatasetComponent } from './main/dataset/dataset.component';
import { SensorComponent } from './main/sensor/sensor.component';
import { MainComponent } from './main/main.component';
import { SensorChartComponent } from './main/sensor-chart/sensor-chart.component';
import { SensorDetailComponent } from './main/sensor-detail/sensor-detail.component';
import { VehicleComponent } from './main/vehicle/vehicle.component';
import { LoraGatewayComponent } from './main/lora-gateway/lora-gateway.component';

export const routes: Routes = [
    {
        path: '', component: MainComponent, children: [
            { path: '', component: HomeComponent},
            { path: 'sensors', component: SensorComponent },
            { path: 'brokers', component: BrokersComponent },
            // { path: 'chat', component: ChatComponent },
            { path: 'dataset', component: DatasetComponent },
            { path: 'chart', component: SensorChartComponent },
            { path: 'device/:id', component: SensorDetailComponent },
            { path: 'vehicles', component: VehicleComponent },
            { path: 'lora-gateway', component: LoraGatewayComponent },
        ]
    },
    { path: '**', component: NotfoundComponent }
];
