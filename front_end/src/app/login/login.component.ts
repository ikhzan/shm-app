import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  errorMessage = "";
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {

  }

  onLogin(form: NgForm) {
    try {
      const loginData = {
        username: form.value['username'],
        password: form.value['password'],
      }

      this.authService.login( loginData ).subscribe({
        next: () => this.router.navigate(['/sensors']),
        error: err => this.errorMessage = 'Invalid credentials'
      });

    } catch (error) {
      console.log("error login")

    }
  }
}
