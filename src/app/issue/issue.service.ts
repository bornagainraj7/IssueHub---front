import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ResponseData } from './../responseData.model';
import { Router } from '@angular/router';
import { SocketService } from './../socket.service';

@Injectable({
  providedIn: 'root'
})
export class IssueService {

  public baseUrl = "http://localhost:3000/api/issue";

  private allIssues = [];
  private issueUpdated = new Subject<any[]>();

  private allAssignedIssues = [];
  private assignedIssuesUpdated = new Subject<any[]>();

  private allComments = [];
  private updatedComment = new Subject<any[]>();

  private allWatchers = [];
  private watchersUpdated = new Subject<any[]>();

  private allAssignees = [];
  private updatedAssignee = new Subject<any[]>();

  private issuesDone: number;
  private issuesInProgress: number;
  private issuesInTest: number;
  private issuesInBacklog: number;
  private totalIssues: number;
  private issuesReportedByUser: number;




  constructor(private http: HttpClient, private socketService: SocketService, private appRouter: Router) { }


  getAllAssignedIssue() {
    return [...this.allAssignedIssues];
  }


  getIssueData() {
    return [...this.allIssues];
  }

  getAllComments() {
    return [...this.allComments];
  }

  getIssueUpdatedListner() {
    return this.issueUpdated.asObservable();
  }

  getUpdatedCommentListener() {
    return this.updatedComment.asObservable();
  }

  getSingleIssue(id: string) {
    return this.http.get<ResponseData>(`${this.baseUrl}/${id}`);
  }

  getWatchersUpdatedList() {
    return this.watchersUpdated.asObservable();
  }

  getUpdatedAssigneeList() {
    return this.updatedAssignee.asObservable();
  }

  getAssignedIssueUpdated() {
    return this.assignedIssuesUpdated.asObservable();
  }




  createIssue(title: string, description: string, status: string, image: File) {
    const issueData = new FormData();
    issueData.append("title", title);
    issueData.append("description", description);
    issueData.append("status", status);
    issueData.append("image", image, 'image');


    this.http.post<ResponseData>(`${this.baseUrl}/create`, issueData)
      .subscribe((response) => {
        if (this.allIssues === null) {
          let retreivedIssues = [];
          retreivedIssues.push(response.data);
          this.allIssues = [...retreivedIssues];
        } else {
          this.allIssues.push(response.data);
        }

        this.issueUpdated.next([...this.allIssues]);

        this.socketService.generalSnackBar("Your issue has been reported successfully");

        setTimeout(() => {
          this.appRouter.navigate(['/issue/all']);
        }, 2500);


      }, (error) => {
        console.log(error);
      });
  }


  updateIssue(id: string, title: string, description: string, status: string, image: string | File) {
    let newIssue: any | FormData
    if (typeof (image) === 'object') {
      newIssue = new FormData();
      newIssue.append('title', title);
      newIssue.append('description', description);
      newIssue.append('status', status);
      newIssue.append('image', image, 'image');
    } else {
      newIssue = {
        title: title,
        description: description,
        status: status,
        imagePath: image
      };
    }
    this.http.put(`${this.baseUrl}/edit/${id}`, newIssue)
      .subscribe((response) => {
        this.getAllIssue();
        this.socketService.issueUpdated(id);
        this.socketService.generalSnackBar("Your issue has been reported successfully");

        setTimeout(() => {
          this.appRouter.navigate(['/issue/all']);
        }, 2500);

      }, (error) => {
        console.log(error);
      });

  }


  deleteIssue(issueId: string) {
    let data = null;

    this.http.post(`${this.baseUrl}/delete/${issueId}`, data)
      .subscribe((response) => {
        this.getAllIssue();

      }, (error) => {
        console.log(error);
      });
  }



  getAllIssue() {
    this.http.get<ResponseData>(`${this.baseUrl}/all`)
    .subscribe((response) => {
      this.allIssues = response.data;
      if(this.allIssues) {
        this.issueUpdated.next([...this.allIssues]);
      } else {
        this.issueUpdated.next(null);
      }

    }, (error) => {
      console.log(error);
    });
  }


  getAllIssuesAssigned() {
    this.http.get<ResponseData>(`${this.baseUrl}/assignedto`)
    .subscribe((response) => {
      this.allAssignedIssues = response.data;
      if(this.allAssignedIssues) {
        this.assignedIssuesUpdated.next([...this.allAssignedIssues]);
      } else {
        this.assignedIssuesUpdated.next(null);
      }

    }, (error) => {
      console.log(error);
    })
  }


  getAllCommentsOnIssue(issueId: string) {
    this.http.get<ResponseData>(`${this.baseUrl}/comment/all/${issueId}`)
    .subscribe((response) => {
      this.allComments = response.data;
      if(this.allComments) {
        this.updatedComment.next([...this.allComments]);
      } else {
        this.updatedComment.next(null);
      }
    },(error) => {
        console.log(error);
    })
  }


  createComment(issueId: string, comment: string) {
    let commentData = {
      issueId: issueId,
      comment: comment
    };

    this.http.post<ResponseData>(`${this.baseUrl}/comment/create`, commentData)
    .subscribe((response) => {

      if(this.allComments === null) {
        let retreivedComments = [];
        retreivedComments.push(response.data);
        this.allComments = [...retreivedComments];
      } else {
        this.allComments.push(response.data);
      }
      this.updatedComment.next([...this.allComments]);
      this.socketService.commentAdded(issueId);
      this.getAllCommentsOnIssue(issueId);

    }, (error) => {
      console.log(error);
    });
  }


  deleteComment(commentId: string, issueId: string) {
    let commentData = {
      commentId: commentId,
      issueId: issueId
    }
    this.http.post<ResponseData>(`${this.baseUrl}/comment/delete`, commentData)
    .subscribe((response) => {
      this.getAllCommentsOnIssue(issueId);
      this.socketService.commentRemoved(issueId);
    }, (error) => {
      console.log(error);
      this.getAllCommentsOnIssue(issueId);
    })
  }


  getAllAssigneesOnIssue(issueId: string) {
    this.http.get<ResponseData>(`${this.baseUrl}/assignee/all/${issueId}`)
    .subscribe((response) => {
      this.allAssignees = response.data;
      if (this.allAssignees) {
        this.updatedAssignee.next([...this.allAssignees]);
      } else {
        this.updatedAssignee.next(null);
      }
    }, (error) => {
      console.log(error);
    })
  }


  addAssignee(assigneeId: string, issueId: string) {
    let assigneeData = {
      assignedTo: assigneeId,
      issueId: issueId
    };

    this.http.post<ResponseData>(`${this.baseUrl}/assignee/add`, assigneeData)
    .subscribe((response) => {
      if (this.allAssignees === null) {
        let retreivedAssignees = [];
        retreivedAssignees.push(response.data);
        this.allAssignees = [...retreivedAssignees];
      } else {
        this.allAssignees.push(response.data);
      }

      this.updatedAssignee.next([...this.allAssignees]);
      this.getAllAssigneesOnIssue(issueId);
      this.socketService.assigneeAdded(issueId);
    }, (error) => {
      console.log(error);
    })
  }


  removeAssignee(assignId: string, issueId: string) {
    this.http.get<ResponseData>(`${this.baseUrl}/assignee/remove/${assignId}`)
    .subscribe((response) => {
      this.getAllAssigneesOnIssue(issueId);
      this.socketService.assigneeRemoved(issueId);
    }, (err) => {
      console.log(err);
      this.getAllAssigneesOnIssue(issueId);
    });
  }


  addToWatch(issueId: string) {
    let issueData = {issueId: issueId};
    this.http.post<ResponseData>(`${this.baseUrl}/add/watch`, issueData)
    .subscribe((response) => {
      if (this.allWatchers === null) {
        let retreivedWatchers = [];
        retreivedWatchers.push(response.data);
        this.allWatchers = [...retreivedWatchers];
      } else {
        this.allWatchers.push(response.data);
      }
      this.socketService.addedToWatchList(issueId);
      this.watchersUpdated.next([...this.allWatchers]);
    }, (err) => {
      console.log(err);
    })
  }


  getWatchersList(issueId: string) {
    this.http.get<ResponseData>(`${this.baseUrl}/watch/all/${issueId}`)
    .subscribe((response) => {
      this.allWatchers = response.data;

      if (this.allWatchers) {
        this.watchersUpdated.next([...this.allWatchers]);
      } else {
        this.watchersUpdated.next(null);
      }
    }, (error) => {
      console.log(error);
    })
  }


  //count functions
  getIssueByUserCount() {
    return this.http.get<ResponseData>(`${this.baseUrl}/count/byuser`);
  }

  getIssuesDoneCount() {
    return this.http.get<ResponseData>(`${this.baseUrl}/count/done`);
  }

  getIssueInProgressCount() {
    return this.http.get<ResponseData>(`${this.baseUrl}/count/inprogress`);
  }

  getIssueInTestCount() {
    return this.http.get<ResponseData>(`${this.baseUrl}/count/intest`);
  }

  getIssueInBacklogCount() {
    return this.http.get<ResponseData>(`${this.baseUrl}/count/backlog`);
  }

  getAllIssuesCount() {
    return this.http.get<ResponseData>(`${this.baseUrl}/count/all`);
  }
}
