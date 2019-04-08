import { Component, OnInit, OnDestroy } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { IssueService } from '../issue.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/user/user.service';
import { SocketService } from './../../socket.service';

@Component({
  selector: 'app-issue-view',
  templateUrl: './issue-view.component.html',
  styleUrls: ['./issue-view.component.css']
})

export class IssueViewComponent implements OnInit, OnDestroy {

  public currentIssue;
  public userIsAuthenticated;
  public authStatusSubs: Subscription;
  public userId: string;
  public userIdSubs: Subscription;
  public issueId: string;
  public allComments = [];
  public upadteCommentsSubs: Subscription;
  public userOnWatchList: boolean = false;
  public allWatchers:any[] = [];
  public updatedWatchersSubs: Subscription;
  public allUsers = [];
  public allAssignees = [];


  constructor(private issueService: IssueService, private userService: UserService, private socketService: SocketService, private route: ActivatedRoute) { }

  ngOnInit() {
    //auto authorising user
    this.userService.autoAuthUser();
    this.issueId = this.route.snapshot.paramMap.get('issueId');

    //retreiving issue
    this.issueService.getSingleIssue(this.issueId)
    .subscribe((response) => {
      this.currentIssue = response.data;
    }, (error) => {
      console.log(error);
    });

    //retreiving comments
    this.issueService.getAllCommentsOnIssue(this.issueId);
    this.upadteCommentsSubs = this.issueService.getUpdatedCommentListener()
    .subscribe((comment) => {
      this.allComments = comment;
    });

    //getting the auth status
    this.userIsAuthenticated = this.userService.getIsAuth();
    this.authStatusSubs = this.userService.getAuthStatusListner()
    .subscribe((authenticated) => {
      this.userIsAuthenticated = authenticated;
    })

    if(this.userIsAuthenticated) {
      this.userId = this.userService.getUserId();
    }

    this.userIdSubs = this.userService.getUserIdListener()
    .subscribe((userId) => {
      this.userId = userId;
    })

    //retreiving watchlist
    this.issueService.getWatchersList(this.issueId);
    this.updatedWatchersSubs = this.issueService.getWatchersUpdatedList()
    .subscribe((watchers) => {
      this.allWatchers = watchers;
      if(this.allWatchers){
        for (let watcher of this.allWatchers) {
          if (watcher.userId == this.userId) {
            this.userOnWatchList = true;
          }
        }
      }
    }, (error) => {
      console.log(error);
    });

    //retreiving all users for new assignee
    this.userService.getAllUsersData()
    .subscribe((users) => {
      this.allUsers = users.data;
    }, (error) => {
      console.log(error);
    });

    //retreiving the assignee list
    this.issueService.getAllAssigneesOnIssue(this.issueId);
    this.issueService.getUpdatedAssigneeList()
    .subscribe((assignees) => {
      this.allAssignees = assignees;
      // console.log(this.allAssignees);
    })

    if(this.userId) {
      this.socketService.allNotificationListener(this.userId)
      .subscribe((data) => {
        this.socketService.showSnackBar(data.issueId, data.message, data.action);
      })
    }



  }

  onComment(form: NgForm) {
    if (form.invalid || form.value.comment.length < 3) {
      form.resetForm();
      return;
    }

    this.issueService.createComment(this.currentIssue.issueId, form.value.comment);
    form.resetForm();
  }


  onClickWatch() {
    this.issueService.addToWatch(this.issueId);
  }

  onAddAssignee(form: NgForm) {
    this.issueService.addAssignee(form.value.assignedUser, this.issueId);
  }

  onDeleteComment(commentId: string) {
    this.issueService.deleteComment(commentId, this.currentIssue.issueId);
  }

  onRemoveAssignee(assignId: string) {
    this.issueService.removeAssignee(assignId, this.issueId);
  }


  ngOnDestroy() {
    this.authStatusSubs.unsubscribe();
    this.upadteCommentsSubs.unsubscribe();
    this.updatedWatchersSubs.unsubscribe();
    this.userIdSubs.unsubscribe();
  }
}
