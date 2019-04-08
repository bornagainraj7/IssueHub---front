import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { MaterialModule } from '../material/material.module';
import { AppRoutingModule } from '../app-routing/app-routing.module';

import { FormsModule } from '@angular/forms';

import { SocialLoginModule, AuthServiceConfig, GoogleLoginProvider } from 'angular-6-social-login';

export function getAuthServiceConfigs() {
  let config = new AuthServiceConfig(
    [
      {
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider("718782623721-3bshdhkpstjjvcdkuqne3106ijl8m9nb.apps.googleusercontent.com")
      },
    ]
  );
  return config;
}

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    AppRoutingModule,
    FormsModule,
    SocialLoginModule
  ],
  declarations: [LoginComponent, SignupComponent],

})
export class UserModule { }
