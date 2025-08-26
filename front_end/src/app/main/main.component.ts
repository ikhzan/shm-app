import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile, faKeyboard, faAngleDown, faListAlt, faUserCircle, faUserAlt, faGear, faSignOut, faMicrophone, faMessage, faPhone, faImage, faVideo, faVoicemail, faContactCard, faLocation, faL } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-main',
  imports: [RouterOutlet, FontAwesomeModule, RouterLink, RouterLinkActive],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
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
  faFile = faFile
  isLogin = false
  profilePath = 'assets/user/profile.png'

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    // Optional: redirect to login or home
    window.location.href = '/login';
  }
}
