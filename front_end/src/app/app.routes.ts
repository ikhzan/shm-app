import { Routes } from '@angular/router';
import { HomeComponent } from './main/home/home.component';
import { BrokersComponent } from './main/brokers/brokers.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { ChatComponent } from './main/chat/chat.component';
import { DatasetComponent } from './main/dataset/dataset.component';
import { SensorComponent } from './main/sensors/sensor/sensor.component';
import { MainComponent } from './main/main.component';
import { SensorDetailComponent } from './main/sensors/detail/sensor-detail.component';
import { SensorsComponent } from './main/sensors/sensors.component';
import { VehicleDetailComponent } from './main/vehicles/detail/vehicle-detail.component';
import { VehicleComponent } from './main/vehicles/vehicle/vehicle.component';
import { VehiclesComponent } from './main/vehicles/vehicles.component';
import { LoraAppComponent } from './main/lora/application/application.component';
import { LoraComponent } from './main/lora/lora.component';
import { LoraGatewayComponent } from './main/lora/gateway/gateway.component';
import { ProfileComponent } from './main/profile/profile.component';
import { PersonalInfoComponent } from './main/profile/personal-info/personal-info.component';
import { EducationComponent } from './main/profile/education/education.component';
import { ExperiencesComponent } from './main/profile/experiences/experiences.component';

export const routes: Routes = [
    {
        path: '', component: MainComponent, children: [
            { path: '', component: HomeComponent },
            { path: 'profile', component: ProfileComponent, children: [
                { path: '', redirectTo: 'person', pathMatch: 'full'},
                { path: 'person', component: PersonalInfoComponent},
                { path: 'education', component: EducationComponent},
                { path: 'experiences', component: ExperiencesComponent}
            ]},
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
            {
                path: 'lora', component: LoraComponent, children: [
                    { path: '', redirectTo: 'app', pathMatch: 'full' },
                    { path: 'app', component: LoraAppComponent },
                    { path: 'gateway', component: LoraGatewayComponent }
                ]
            },
            { path: 'brokers', component: BrokersComponent },
            { path: 'chat', component: ChatComponent },
            { path: 'dataset', component: DatasetComponent },
        ]
    },
    { path: '**', component: NotfoundComponent }
];
