import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserData } from './user-data.model';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ResponseData } from './../responseData.model';
import { SocketService } from './../socket.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private authToken;
  public baseUrl = "http://localhost:3000/api/users";
  private authStatusListner = new Subject<boolean>();
  private isAuthenticated = false;
  private userId: string;
  private userIdListener = new Subject<any>();
  private userFullName: string;
  private userFullNameListener = new Subject<any>();

  private tokenTimer: any;


  constructor(private http: HttpClient, private socketService: SocketService, private appRouter: Router) { }

  getAuthToken() {
    return this.authToken;
  }


  getAuthStatusListner() {
    return this.authStatusListner.asObservable();
  }


  getIsAuth() {
    return this.isAuthenticated;
  }


  getUserId() {
    return this.userId;
  }


  getUserFullName() {
    return this.userFullName;
  }


  getFullNameListener() {
    return this.userFullNameListener.asObservable();
  }


  getUserIdListener() {
    return this.userIdListener.asObservable();
  }


  autoAuthUser() {
    const userAuthInfo = this.getAuthData();

    if (!userAuthInfo) {
      return;
    }

    const now = new Date();
    const expiresIn = userAuthInfo.expiration.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.authToken = userAuthInfo.authToken;
      this.isAuthenticated = true;
      this.userId = userAuthInfo.userId;
      this.userFullName = userAuthInfo.fullName;
      this.userFullNameListener.next(this.userFullName);
      this.authStatusListner.next(true);
      this.userIdListener.next(this.userId);
      this.setAuthTimer(expiresIn / 1000);

      this.socketService.setUser(this.authToken);
      this.socketService.verifyUser(this.authToken);
    }

  }

  getAllUsersData() {
    return this.http.get<ResponseData>(`${this.baseUrl}/all`);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string, fullName: string) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('fullName', fullName);
  }

  private removeAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullname');
  }

  private getAuthData() {
    const token = localStorage.getItem('authToken');
    const expiresIn = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const fullName = localStorage.getItem('fullName');

    if (!token || !expiresIn) {
      return;
    }
    return {
      authToken: token,
      expiration: new Date(expiresIn),
      userId: userId,
      fullName: fullName
    }
  }



  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }



  createUser(userData) {
    const newUser: UserData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      mobileNumber: userData.mobileNumber
    }
    this.http.post<ResponseData>(`${this.baseUrl}/signup`, newUser)
      .subscribe((response) => {
        const authToken = response.data.authToken;
        this.authToken = authToken;

        if (authToken) {
          const expiresIn = response.data.expiresIn;

          this.setAuthTimer(expiresIn);

          this.isAuthenticated = true;
          this.authStatusListner.next(true);

          this.userId = response.data.userId;
          this.userIdListener.next(this.userId);

          this.userFullName = response.data.userDetails.fullName;
          this.userFullNameListener.next(this.userFullName);


          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresIn * 1000);

          this.saveAuthData(authToken, expirationDate, this.userId, this.userFullName);
          this.socketService.setUser(this.authToken);
          this.socketService.verifyUser(this.authToken);

          this.socketService.generalSnackBar("Your account was created and you've logged in successfully");

          setTimeout(() => {
            this.appRouter.navigate(['/']);
          }, 3000);

        }
      }, (error) => {
        console.log(error);
      });
  }


  loginUser(email: string, password: string) {
    let loginData = { email: email, password: password };
    this.http.post<ResponseData>(`${this.baseUrl}/login`, loginData)
      .subscribe((response) => {

        const authToken = response.data.authToken;
        this.authToken = authToken;

        if (authToken) {
          const expiresIn = response.data.expiresIn;

          this.setAuthTimer(expiresIn);

          this.isAuthenticated = true;
          this.authStatusListner.next(true);

          this.userId = response.data.userId;
          this.userIdListener.next(this.userId);

          this.userFullName = response.data.userDetails.fullName;
          this.userFullNameListener.next(this.userFullName);


          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresIn * 1000);

          this.saveAuthData(authToken, expirationDate, this.userId, this.userFullName);
          this.socketService.setUser(this.authToken);
          this.socketService.verifyUser(this.authToken);

          this.socketService.generalSnackBar("You've logged in successfully");

          setTimeout(()=> {
            this.appRouter.navigate(['/']);
          }, 3000);

        }

      }, (error) => {
        console.log(error);
      });
  }


  googleLogin(data) {

    this.http.post<ResponseData>(`${this.baseUrl}/login/google`, data)
    .subscribe((response) => {
      const authToken = response.data.authToken;
      this.authToken = authToken;

      if (authToken) {
        const expiresIn = response.data.expiresIn;

        this.setAuthTimer(expiresIn);

        this.isAuthenticated = true;
        this.authStatusListner.next(true);

        this.userId = response.data.userId;
        this.userIdListener.next(this.userId);

        this.userFullName = response.data.userDetails.fullName;
        this.userFullNameListener.next(this.userFullName);


        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresIn * 1000);

        this.saveAuthData(authToken, expirationDate, this.userId, this.userFullName);
        this.socketService.setUser(this.authToken);
        this.socketService.verifyUser(this.authToken);

        this.socketService.generalSnackBar("You've logged in successfully");

        setTimeout(() => {
          this.appRouter.navigate(['/']);
        }, 3000);
      }

    }, (error) => {
      console.log(error);
    })
  }


  logout() {
    let authtoken = this.authToken;
    this.http.post(`${this.baseUrl}/logout`, authtoken)
      .subscribe((response) => {
        this.authToken = null;
        this.isAuthenticated = false;
        this.authStatusListner.next(false);
        this.userId = null;
        clearTimeout(this.tokenTimer);
        this.removeAuthData();
        this.appRouter.navigate(['/']);
      }, (error) => {
        console.log(error);
      });

  }

  getTotalUsersCount() {
    return this.http.get<ResponseData>(`${this.baseUrl}/count/all`)
  }

}
