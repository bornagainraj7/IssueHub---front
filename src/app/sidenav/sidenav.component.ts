import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { UserService } from '../user/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit, OnDestroy {

  private authStatusSubs: Subscription;
  public userIsAuthenticated = false;
  public userFullName: string;
  @Output() closeSidenav = new EventEmitter<void>();

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userIsAuthenticated = this.userService.getIsAuth();
    this.authStatusSubs = this.userService.getAuthStatusListner()
    .subscribe((isAuthenticated) => {
      this.userIsAuthenticated = isAuthenticated;
    });

    if(this.userIsAuthenticated) {
      this.userFullName = this.userService.getUserFullName();
    }
  }

  onLogout() {
    this.closeSidenav.emit();
    this.userService.logout();
  }

  onClose() {
    this.closeSidenav.emit();
  }

  ngOnDestroy() {
    this.authStatusSubs.unsubscribe();
  }

}
