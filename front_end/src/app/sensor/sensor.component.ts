import { Component } from '@angular/core';
import { Sensor } from './sensor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt, faClose, faSearch } from '@fortawesome/free-solid-svg-icons';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-sensor',
  imports: [FontAwesomeModule, NgFor],
  templateUrl: './sensor.component.html',
  styleUrl: './sensor.component.scss'
})
export class SensorComponent {
  faSearch = faSearch
  faTrash = faTrashAlt
  faClose = faClose
  modalDeleteON = true
  sensors: Sensor[] = [
    { id: 1, name: 'Temperature Sensor', data: 'Thermocouple', time: new Date('2024-06-01T10:00:00') },
    { id: 2, name: 'Pressure Sensor', data: 'Piezoelectric', time: new Date('2024-06-01T11:00:00') },
    { id: 3, name: 'Humidity Sensor', data: 'Capacitive', time: new Date('2024-06-01T12:00:00') }
  ];

  showDeleteModal() {
    this.modalDeleteON = false
  }

  closeDeleteModal() {
    this.modalDeleteON = true
  }

  deleteFile() {
    this.modalDeleteON = true
  }

}
