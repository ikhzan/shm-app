import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile, faKeyboard, faBars, faXmark, faAngleDown, faListAlt, faUserCircle, faUserAlt, faGear, faSignOut, faMicrophone, faMessage, faPhone, faImage, faVideo, faVoicemail, faContactCard, faLocation, faL } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../services/auth.service';
import { LoginModalComponent } from '../shared/login-modal/login-modal.component';
import { interval } from 'rxjs';
import { LoadingSpinnerService } from '../shared/loading-spinner/loading-spinner.service';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, NgFor, FontAwesomeModule, RouterLink, RouterLinkActive, NgIf, LoginModalComponent],
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
  isOpen = false;

  menuLinks = [
    { label: 'Sensors', link: '/sensors' },
    { label: 'Vehicles', link: '/vehicles' },
    { label: 'Brokers', link: '/brokers' },
    { label: 'Dataset', link: '/dataset' }
  ];

  constructor(private authService: AuthService, private router: Router, private loadingService: LoadingSpinnerService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isMenuOpen = false;
      }
    });
  }

  toggleMenu(): void {
    this.isMenu = !this.isMenu;
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    this.isLoggedIn = false;
    this.isOpen = false;
  }

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('access');

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
    this.isOpen = false;
  }

  handleLogin(credentials: { username: string; password: string }) {
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        localStorage.setItem('username', credentials.username);
        this.isLoginModalVisible = false;
        this.isLoggedIn = true
        this.loadingService.hide()
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.loadingService.hide();
      }
    });
  }

  openMenu() {
    this.isOpen = !this.isOpen;
  }

}
