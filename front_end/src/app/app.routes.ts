import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SensorComponent } from './sensor/sensor.component';
import { BrokersComponent } from './brokers/brokers.component';
import { LogsComponent } from './logs/logs.component';
import { NotfoundComponent } from './notfound/notfound.component';

export const routes: Routes = [
    {path: '', component: HomeComponent}, 
    {path: 'sensors', component: SensorComponent},
    {path: 'brokers', component: BrokersComponent},
    {path: 'logs', component: LogsComponent},
    {path: '**', component: NotfoundComponent}
];
