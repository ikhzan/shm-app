import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faClose } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-delete-data-modal',
  imports: [FontAwesomeModule],
  standalone: true,
  templateUrl: './delete-data-modal.component.html',
  styleUrl: './delete-data-modal.component.scss'
})
export class DeleteDataModalComponent {
  faClose: IconDefinition = faClose;

  @Input() visible = false;
  @Input() title = 'Delete Item';
  @Input() message: string = '';


  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onCancel() {
    this.cancel.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }

}
