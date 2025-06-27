import { Component } from '@angular/core';
import { Broker } from './broker'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt, faClose, faSearch } from '@fortawesome/free-solid-svg-icons';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-brokers',
  imports: [NgFor, FontAwesomeModule],
  templateUrl: './brokers.component.html',
  styleUrl: './brokers.component.scss'
})
export class BrokersComponent {
  faSearch = faSearch
  faTrash = faTrashAlt
  faClose = faClose
  modalDeleteON = true
  // ,,,,

  brokers: Broker[] = [
    {
      id: 1,
      name: 'humidity 1',
      url: 'v3/humidity-sensor@zaim-university/devices/eui-a84041e2b1829f76/up',
      status: 'active'
    },
    {
      id: 2,
      name: 'humidity 2',
      url: 'v3/humidity-sensor@zaim-university/devices/eui-a840418d81829f8a/up',
      status: 'active'
    },
    {
      id: 3,
      name: 'lora 2',
      url: 'v3/humidity-sensor@zaim-university/devices/lora-2/up',
      status: 'active'
    },
    {
      id: 4,
      name: 'lora 3',
      url: 'v3/humidity-sensor@zaim-university/devices/lora-3/up',
      status: 'active'
    },
    {
      id: 5,
      name: 'lora 1',
      url: 'v3/humidity-sensor@zaim-university/devices/lora-1/up',
      status: 'active'
    }
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
