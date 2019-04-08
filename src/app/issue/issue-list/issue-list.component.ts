import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { IssueService } from '../issue.service';
import { Subscription, Subject } from 'rxjs';
import { UserService } from './../../user/user.service';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'app-issue-list',
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.css']
})
export class IssueListComponent implements OnInit, AfterViewInit, OnDestroy {

  public allIssues = new MatTableDataSource<any>();
  private issueSubs: Subscription;
  public userId: string;
  public userIdSubs: Subscription;
  public userIsAuthenticated;
  public authStatusSubs: Subscription;

  @ViewChild(MatSort) sortingTable: MatSort;

  @ViewChild(MatPaginator) tablePaginator: MatPaginator;

  columnsToDisplay = ['status', 'title', 'reporter', 'date', 'actions'];

  constructor(private issueService: IssueService, private userService: UserService, private socketService: SocketService) { }

  ngOnInit() {
    this.userId = this.userService.getUserId();
    this.issueService.getAllIssue();
    this.issueSubs = this.issueService.getIssueUpdatedListner()
      .subscribe((issue) => {
        this.allIssues.data = issue;
      });

    this.userIsAuthenticated = this.userService.getIsAuth();
    this.authStatusSubs = this.userService.getAuthStatusListner()
    .subscribe((authenticated) => {
      this.userIsAuthenticated = authenticated;
    });
    if (this.userIsAuthenticated) {
      this.userId = this.userService.getUserId();
    }
    this.userIdSubs = this.userService.getUserIdListener()
    .subscribe((userId) => {
      this.userId = userId;
    });

    //paginator
    this.allIssues.paginator = this.tablePaginator;

    if (this.userId) {
    this.socketService.allNotificationListener(this.userId)
      .subscribe((data) => {
        this.socketService.showSnackBar(data.issueId, data.message, data.action);
      })
    }


  }

  ngAfterViewInit() {
    //sorting
    this.allIssues.sort = this.sortingTable;
  }

  onDelete(issueId: string) {
    this.issueService.deleteIssue(issueId);
  }


  ngOnDestroy() {
    this.issueSubs.unsubscribe();
    this.authStatusSubs.unsubscribe();
    this.userIdSubs.unsubscribe();
  }

}
