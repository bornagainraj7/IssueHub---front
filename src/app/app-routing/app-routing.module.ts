import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from '../issue/dashboard/dashboard.component';
import { IssueListComponent } from '../issue/issue-list/issue-list.component';
import { IssueCreateComponent } from '../issue/issue-create/issue-create.component';
import { IssueViewComponent } from '../issue/issue-view/issue-view.component';
import { LoginComponent } from '../user/login/login.component';
import { SignupComponent } from '../user/signup/signup.component';
import { SearchComponent } from '../issue/search/search.component';
import { RouteGuard } from './../user/route.guard';



const routes: Routes = ([
  { path: 'dashboard', component: DashboardComponent, canActivate: [RouteGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'search/:search', component: SearchComponent, canActivate: [RouteGuard] },
  { path: 'issue/all', component: IssueListComponent, canActivate: [RouteGuard] },
  { path: 'issue/create', component: IssueCreateComponent, canActivate: [RouteGuard] },
  { path: 'issue/edit/:issueId', component: IssueCreateComponent, canActivate: [RouteGuard] },
  { path: 'issue/:issueId', component: IssueViewComponent, canActivate: [RouteGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent }
])


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [RouteGuard],
  declarations: []
})
export class AppRoutingModule { }
