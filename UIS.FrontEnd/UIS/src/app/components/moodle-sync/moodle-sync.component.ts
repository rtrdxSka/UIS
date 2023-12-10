import { Component } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


import { RequestsMoodleService } from './../../services/http/requests-moodle.service';

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

  private createForm() {
    this.csvForm = this.formBuilder.group({
       csvFile: ['', [ Validators.required ]],
    });
  }
}
