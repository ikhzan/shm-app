import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile, faKeyboard, faAngleDown, faListAlt, faUserCircle, faUserAlt, faGear, faSignOut, faMicrophone, faMessage,faPhone,faImage,faVideo,faVoicemail,faContactCard,faLocation, faL } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FontAwesomeModule, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front_end';

  faListSquares = faListAlt
  faAngleDown = faAngleDown;
  faUser = faUserCircle
  faUserAlt = faUserAlt
  faGear = faGear
  faSignOut = faSignOut
  faMicrophone =  faMicrophone
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
  selectedDevice = 'Select Device'

  logout(){
   
  }
}
