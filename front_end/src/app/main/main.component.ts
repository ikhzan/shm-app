import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd, Router  } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile, faKeyboard, faBars, faXmark, faAngleDown, faListAlt, faUserCircle, faUserAlt, faGear, faSignOut, faMicrophone, faMessage, faPhone, faImage, faVideo, faVoicemail, faContactCard, faLocation, faL } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../services/auth.service';
import { LoginModalComponent } from '../shared/login-modal/login-modal.component';
import { interval } from 'rxjs';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, FontAwesomeModule, RouterLink, RouterLinkActive, NgIf, LoginModalComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  title = 'front_end';
  username = localStorage.getItem('username');
  faListSquares = faListAlt
  faAngleDown = faAngleDown;
  faUser = faUserCircle
  faUserAlt = faUserAlt
  faGear = faGear
  faSignOut = faSignOut
  faMicrophone = faMicrophone
  faMessage = faMessage
  faPhone = faPhone
  faImage = faImage
  faVideo = faVideo
  faVoicemail = faVoicemail
  faContact = faContactCard
  faLocation = faLocation
  faKeyboard = faKeyboard
  faBars = faBars
  faXmark = faXmark
  faFile = faFile
  isLogin = false
  profilePath = 'assets/user/profile.png'
  isLoggedIn = false;
  isLoginModalVisible = false;
  currentTime = '';
  isMenu = false;
  isMenuOpen = true;

  constructor(private authService: AuthService, private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isMenuOpen = false;
      }
    });
  }


  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    this.isLoggedIn = false;
  }

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('access_token');

    interval(1000).subscribe(() => {
      const now = new Date();
      this.currentTime = now.toLocaleString(); // e.g. "18:03:25"
    });
  }

  openMobileMenu() {
    this.isMenu = !this.isMenu;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  login() {
    this.isLoginModalVisible = true;
  }

  handleLogin(credentials: { username: string; password: string }) {
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        localStorage.setItem('username', credentials.username);
        this.isLoginModalVisible = false;
        this.isLoggedIn = true
      },
      error: (err) => {
        console.error('Login failed:', err);
        // Optionally show error inside modal
      }
    });
  }

}
