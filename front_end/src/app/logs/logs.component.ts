import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt,faClose, faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-logs',
  imports: [FontAwesomeModule],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss'
})
export class LogsComponent {
  faSearch = faSearch
  faTrash  = faTrashAlt
  faClose = faClose
  modalDeleteON = true
}
