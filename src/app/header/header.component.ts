import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private authStatusSubs :Subscription;
  public userIsAuthenticated = false;
  public userFullName: string;
  private userFullNameSubs: Subscription;
  @Output() sidenavToggle = new EventEmitter<void>();

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userIsAuthenticated = this.userService.getIsAuth();
    this.authStatusSubs = this.userService.getAuthStatusListner()
    .subscribe((isAuthenticated) => {
      this.userIsAuthenticated = isAuthenticated;
    });

    this.userFullName = this.userService.getUserFullName();
    this.userFullNameSubs = this.userService.getFullNameListener()
    .subscribe((name) => {
      this.userFullName = name;
    })
  }


  onLogout() {
    this.userService.logout();
  }

  onToggle() {
    this.sidenavToggle.emit();
  }

  ngOnDestroy() {
    this.authStatusSubs.unsubscribe();
    this.userFullNameSubs.unsubscribe();
  }

}
