import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { IssueService } from '../issue.service';
import { UserService } from './../../user/user.service';
import { SocketService } from 'src/app/socket.service';

import { Subscription, Subject } from 'rxjs';
import { ResponseData } from 'src/app/responseData.model';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  public allAssignedIssues = new MatTableDataSource<any>();
  public issueSubs: Subscription;
  public userId: string;
  public userIdSubs: Subscription;
  public userIsAuthenticated;
  public authStatusSubs: Subscription;

  public allUsersCount: number;
  public allIssuesCount: number;
  public allIssuesDoneCount: number;
  public allIssuesInProgressCount: number;
  public allIssuesInTestCount: number;
  public allIssuesBacklogCount: number;
  public allIssuesReportedByUserCount: number

  @ViewChild(MatSort) sortingTable: MatSort;

  @ViewChild(MatPaginator) tablePaginator: MatPaginator;

  columnsToDisplay = ['status', 'title', 'reporter', 'date', 'actions'];

  constructor(private issueService: IssueService, private userService: UserService, private socketService: SocketService) { }

  ngOnInit() {
    this.userId = this.userService.getUserId();
    this.issueService.getAllIssuesAssigned();
    this.issueSubs = this.issueService.getAssignedIssueUpdated()
      .subscribe((issue) => {
        this.allAssignedIssues.data = issue;
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
    this.allAssignedIssues.paginator = this.tablePaginator;

    //notification
    if (this.userId) {
      this.socketService.allNotificationListener(this.userId)
        .subscribe((data) => {
          this.socketService.showSnackBar(data.issueId, data.message, data.action);
        })
    }

    // counts
    this.userService.getTotalUsersCount()
    .subscribe((response) => {
      this.allUsersCount = response.data;
    }, (error) => {
      console.log(error);
    })

    this.issueService.getIssueByUserCount()
      .subscribe((response) => {
        this.allIssuesReportedByUserCount = response.data;
      }, (error) => {
        console.log(error);
      })


    this.issueService.getIssuesDoneCount()
      .subscribe((response) => {
        this.allIssuesDoneCount = response.data;
      }, (error) => {
        console.log(error);
      })

    this.issueService.getIssueInBacklogCount()
      .subscribe((response) => {
        this.allIssuesBacklogCount = response.data;
      }, (error) => {
        console.log(error);
      })

    this.issueService.getIssueInProgressCount()
      .subscribe((response) => {
        this.allIssuesInProgressCount = response.data;
      }, (error) => {
        console.log(error);
      })

    this.issueService.getIssueInTestCount()
      .subscribe((response) => {
        this.allIssuesInTestCount = response.data;
      }, (error) => {
        console.log(error);
      })

    this.issueService.getAllIssuesCount()
      .subscribe((response) => {
        this.allIssuesCount = response.data;
      }, (error) => {
        console.log(error);
      })

  }

  ngAfterViewInit() {
    //sorting
    this.allAssignedIssues.sort = this.sortingTable;
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
