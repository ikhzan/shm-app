import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SensorComponent } from './sensor/sensor.component';
import { BrokersComponent } from './brokers/brokers.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { DatasetComponent } from './dataset/dataset.component';

export const routes: Routes = [
    {path: '', component: HomeComponent}, 
    {path: 'sensors', component: SensorComponent},
    {path: 'brokers', component: BrokersComponent},
    {path: 'chat', component: ChatComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'setting', component: SettingsComponent},
    {path: 'dataset', component: DatasetComponent},
    {path: '**', component: NotfoundComponent}
];
