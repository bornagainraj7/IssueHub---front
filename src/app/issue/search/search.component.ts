import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { IssueService } from './../issue.service';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/user/user.service';
import { SocketService } from 'src/app/socket.service';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {

  public allIssues = new MatTableDataSource<any>();
  public searchtext: string;
  private issueSubs: Subscription;
  public userId: string;
  public userIsAuthenticated;
  public authStatusSubs: Subscription;

  columnsToDisplay = ['status', 'title', 'reporter', 'date', 'actions'];

  @ViewChild(MatSort) sortingTable: MatSort;

  @ViewChild(MatPaginator) tablePaginator: MatPaginator;


  constructor(private issueService: IssueService, private userService: UserService, private socketService: SocketService, private route: ActivatedRoute, private appRouter: Router) { }

  ngOnInit() {
    this.searchtext = this.route.snapshot.paramMap.get('search');
    if (!this.searchtext) {
      this.appRouter.navigate(['/dashboard']);
    }
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
    this.doFilter(this.searchtext);
    this.allIssues.paginator = this.tablePaginator;

    //notification
    if (this.userId) {
      this.socketService.allNotificationListener(this.userId)
        .subscribe((data) => {
          this.socketService.showSnackBar(data.issueId, data.message, data.action);
        })
    }

  }

  ngAfterViewInit() {
    this.allIssues.sort = this.sortingTable;
  }

  doFilter(newSearchText: string) {
    this.allIssues.filter = newSearchText.trim().toLowerCase();
  }

  onDelete(issueId: string) {
    this.issueService.deleteIssue(issueId);
  }


  ngOnDestroy() {
    this.issueSubs.unsubscribe();
  }

}
