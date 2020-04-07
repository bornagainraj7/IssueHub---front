import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private url = "http://api.issuehub.tk";
  private socket: any;

  constructor(public http: HttpClient, private snackBar: MatSnackBar, private appRouter: Router) {
    this.socket = io("http://api.issuehub.tk");
  }

  public showSnackBar(issueId: string, message: string, action: string) {
    const snackBarRef = this.snackBar.open(message, action, { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top' });

    if (action) {
      snackBarRef.onAction().subscribe(() => {
        this.appRouter.navigate([`/issue/${issueId}`]);
      });
    }

  }

  public generalSnackBar(message: string) {
    this.snackBar.open(message, null, { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
  }


  public verifyUser(authToken) {
    // console.log("verifying user....")
    return Observable.create((observer) => {
      this.socket.on('verify-user', (data) => {

        this.socket.emit('set-user', authToken);

        observer.next(data);
      });
    });
  }

  public setUser(authToken) {
    this.socket.emit('set-user', authToken);
  }


  public disconnectSocket() {
    return Observable.create((observer) => {
      this.socket.on('disconnect', () => {
        observer.next();
      });
    });
  }

  public exitSocket() {
    this.socket.disconnect();
  }


  //Events

  public issueUpdated(issueId: string) {
    this.socket.emit('issue-updated', issueId);
  }

  public commentAdded(issueId: string) {
    this.socket.emit('comment-added', issueId);
  }

  public commentRemoved(issueId: string) {
    this.socket.emit('comment-removed', issueId);
  }

  public assigneeAdded(issueId: string) {
    this.socket.emit('assignee-added', issueId);
  }

  public assigneeRemoved(issueId: string) {
    this.socket.emit('assignee-removed', issueId);
  }

  public addedToWatchList(issueId) {
    this.socket.emit('watcher-added', issueId);
  }


  //NOTIFICATIONS

  public allNotificationListener(userId) {
    return Observable.create((observer) => {
      this.socket.on(userId, (data) => {
        observer.next(data);
      })
    });
  }

}
