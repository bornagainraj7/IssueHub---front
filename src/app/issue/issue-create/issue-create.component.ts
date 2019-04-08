import { Component, OnInit } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { IssueService } from '../issue.service';
import { mimeType } from './mime-type.validator';
import { UserService } from 'src/app/user/user.service';


@Component({
  selector: 'app-issue-create',
  templateUrl: './issue-create.component.html',
  styleUrls: ['./issue-create.component.css']
})
export class IssueCreateComponent implements OnInit {

  public mode = "create";
  private issueId: string;
  issueToEdit;
  imagePreview: string;
  allUsers = [];

  issueStatus: string[] = ['backlog', 'in-progress', 'in-test', 'done'];

  form: FormGroup;


  constructor(private issueService: IssueService, private userService: UserService, public route: ActivatedRoute) { }

  ngOnInit() {

    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      description: new FormControl(null, { validators: [Validators.required, Validators.minLength(5)] }),
      status: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] })
    });


    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('issueId')) {
        this.mode = 'edit';
        this.issueId = paramMap.get('issueId');
        this.issueService.getSingleIssue(this.issueId)
          .subscribe((issueData) => {
            this.issueToEdit = issueData.data;

            this.form.setValue({
              title: this.issueToEdit.title,
              description: this.issueToEdit.description,
              status: this.issueToEdit.status,
              image: this.issueToEdit.imagePath
            });
          }, (error) => {
            console.log(error);
          });
      } else {
        this.mode = 'create';
        this.issueId = null;
      }
    });

    this.userService.getAllUsersData()
    .subscribe((response) => {
      this.allUsers = response.data;
    }, (error) => {
      console.log(error);
    });

  }


  onImagePicked(event: Event) {
    const image = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: image });
    this.form.get('image').updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result.toString();
    };
    reader.readAsDataURL(image);
  }


  onSaveIssue() {
    if (this.form.invalid) {
      return;
    }
    if (this.mode === 'create') {
      this.issueService.createIssue(this.form.value.title, this.form.value.description, this.form.value.status, this.form.value.image);
    } else {
      this.issueService.updateIssue(this.issueId, this.form.value.title, this.form.value.description, this.form.value.status, this.form.value.image);
    }
  }


}
