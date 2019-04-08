import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../user.service';
import { AuthService, GoogleLoginProvider } from 'angular-6-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(public userService: UserService, private socialAuthService: AuthService) { }

  ngOnInit() {
  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      form.resetForm();
      return;
    }

    // console.log(form.value);
    this.userService.loginUser(form.value.email, form.value.password);
  }

  // onGoogleLogin() {
  //   this.userService.googleLogin();
  // }

  socialSignIn() {
    let socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    this.socialAuthService.signIn(socialPlatformProvider).then((userData) => {
      let name = userData.name.split(" ");
      let firstName = name[0];
      let possibleLastName = [];

      for (let i = 0; i < name.length; i++) {
        if (i !== 0) {
          possibleLastName.push(name[i]);
        }
      }
      let lastName = possibleLastName.join(' ');
      let data = {
        firstName: firstName,
        lastName: lastName,
        email: userData.email
      }
      this.userService.googleLogin(data);
    })
  }
}
