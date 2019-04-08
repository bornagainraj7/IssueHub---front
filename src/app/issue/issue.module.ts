import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IssueCreateComponent } from './issue-create/issue-create.component';
import { IssueListComponent } from './issue-list/issue-list.component';
import { IssueViewComponent } from './issue-view/issue-view.component';
import { SearchComponent } from './search/search.component';
import { MaterialModule } from './../material/material.module';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EditorModule } from '@tinymce/tinymce-angular';



@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    EditorModule,
    MatSortModule
  ],
  declarations: [DashboardComponent, IssueCreateComponent, IssueListComponent, IssueViewComponent, SearchComponent]
})
export class IssueModule { }
