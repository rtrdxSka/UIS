import { Component } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


import { RequestsMoodleService, UpdateMoodleBody } from './../../services/http/requests-moodle.service';

import { DataToUpdateCohort } from './../../models/moodle';

@Component({
  selector: 'app-moodle-sync',
  standalone: true,
  templateUrl: './moodle-sync.component.html',
  styleUrls: ['./moodle-sync.component.css'],
  imports: [
    NgTemplateOutlet,
    NgClass,
    FormsModule,
    ReactiveFormsModule,

  ],
})

export class MoodleSyncComponent {
  
  constructor(
    private formBuilder: FormBuilder,
    private requestsMoodleService: RequestsMoodleService) {

    this.createForm();
  }

  public csvForm!: FormGroup;
  public selectedCohort!: DataToUpdateCohort;
  public cohortsUpdateData!: DataToUpdateCohort[];

  private csvFile!: File;
  
  public async getCohortsUpdateData() {
    const formData: FormData = new FormData();
    formData.append('csvFile', this.csvFile);

    this.requestsMoodleService.getUpdatedCohortInfo(formData).subscribe((data) => {
      this.cohortsUpdateData = data;
      this.selectedCohort = this.cohortsUpdateData[0];
      console.log(this.cohortsUpdateData);
    })
  }

  public onUploadFile(event: any) {
    this.csvFile = event.target.files[0];
  }

  public revertChanges() {
    this.cohortsUpdateData = [];
  }

  public updateCohorts() {
    this.removeStudentsFromCohort();
    this.addStudentsToCohort();
  }

  private removeStudentsFromCohort(): void {
    for(let cohortData of this.cohortsUpdateData) {
      if(!cohortData.studentsToRemoveFromCohort) {
        return;
      }

      const removeStudentsBody: UpdateMoodleBody = {
        data: cohortData.studentsToRemoveFromCohort,
        cohortId: cohortData.cohortId.toString(),
      }
  
      this.requestsMoodleService.removeStudentsFromCohort(removeStudentsBody).subscribe(() => {
        console.log('successful');
        // TODO: Add snackbar
      });
    }
  }

  private addStudentsToCohort(): void {
    for(let cohortData of this.cohortsUpdateData) {
      if(!cohortData.studentsToAddToCohort) {
        return;
      }

      const addStudentsBody: UpdateMoodleBody = {
        data: cohortData.studentsToAddToCohort,
        cohortId: cohortData.cohortId.toString(),
      }
  
      this.requestsMoodleService.addStudentsToCohort(addStudentsBody).subscribe(() => {
        console.log('successful');
        // TODO: Add snackbar
      });
    }
  }

  private createForm() {
    this.csvForm = this.formBuilder.group({
       csvFile: ['', [ Validators.required ]],
    });
  }
}
