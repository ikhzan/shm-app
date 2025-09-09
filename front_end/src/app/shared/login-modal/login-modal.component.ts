import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerService } from '../loading-spinner/loading-spinner.service';


@Component({
  selector: 'app-login-modal',
  imports: [FormsModule, FontAwesomeModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.scss'
})
export class LoginModalComponent implements OnInit {
  faClose = faClose;
  loginForm!: FormGroup;
  errorMessage: string | null = null;

  @Input() visible = false;
  @Input() title = 'Login';

  @Output() cancel = new EventEmitter<void>();
  @Output() login = new EventEmitter<{ username: string; password: string }>();

  constructor(private fb: FormBuilder, private loadingService: LoadingSpinnerService) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onCancel() {
    this.cancel.emit();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loadingService.show();
      this.errorMessage = null;

      this.login.emit(this.loginForm.value);
    } else {
      this.loadingService.hide();
      this.errorMessage = 'Please fill in both fields.';
    }

  }

  showError(message: string) {
    this.loadingService.hide();
    this.errorMessage = message;
  }

  resetState() {
    this.loadingService.hide();
    this.errorMessage = null;
    this.loginForm.reset();
  }

}
