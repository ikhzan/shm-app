import { Routes } from '@angular/router';
import { HomeComponent } from './main/home/home.component';
import { BrokersComponent } from './main/brokers/brokers.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { ChatComponent } from './main/chat/chat.component';
import { DatasetComponent } from './main/dataset/dataset.component';
import { LoginComponent } from './login/login.component';
import { SensorComponent } from './main/sensor/sensor.component';
import { MainComponent } from './main/main.component';

export const routes: Routes = [
    {
        path: '', component: MainComponent, children: [
            { path: '', component: HomeComponent},
            { path: 'sensors', component: SensorComponent },
            { path: 'brokers', component: BrokersComponent },
            { path: 'chat', component: ChatComponent },
            { path: 'dataset', component: DatasetComponent },
        ]
    },
    { path: 'login', component: LoginComponent },
    { path: '**', component: NotfoundComponent }
];
