import { Injectable } from '@angular/core';
import { IssueService } from './issue/issue.service';
import { UserService } from './user/user.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  public userId: string;

  constructor(private snackBar: MatSnackBar, private appRouter: Router) { }

  showSnackBar(issueId: string, message: string, action: string) {
    const snackBarRef = this.snackBar.open(message, action, {duration: 3000, horizontalPosition: 'end', verticalPosition: 'top'});

    if(action) {
      snackBarRef.onAction().subscribe(() => {
        this.appRouter.navigate([`/issue/${issueId}`]);
      });
    }

  }

}
