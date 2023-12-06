import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

import { DataToUpdateCohort, MoodleCohort, StudentInfo } from "../../models/moodle";

@Injectable({
    providedIn: 'root',
})

export class RequestsMoodleService {

    constructor(private http: HttpClient) { }

    private moodleApiUrl = 'http://localhost/webservice/rest/server.php';
    private uisApiUrl = 'http://localhost:7009/';
    private wstoken = '9d21c61ac5ffa93a2dc9a3e6102fc67a';

    public getUsersInCohort(cohortId: number): Observable<MoodleCohort> {
        return this.http.get<MoodleCohort>(`${this.moodleApiUrl}
            ?wstoken=${this.wstoken}&wsfunction=core_cohort_get_cohort_members&moodlewsrestformat=json&cohortids[]=${cohortId}`);
    }

    public getUserInfoById(userId: string): Observable<StudentInfo> {
        const body = {
            wstoken: this.wstoken,
            wsfunction: 'core_user_get_users',
            moodlewsrestformat: 'json',
            'criteria[0][key]': 'id',
            'criteria[0][value]': userId,
        };

        return this.http.post<StudentInfo>(`${this.moodleApiUrl}`, body);
    }

    // TODO: Sends CSV file through headers
    public getUpdatedCohortInfo(): Observable<DataToUpdateCohort> {
        return this.http.post<DataToUpdateCohort>(`${this.uisApiUrl}`, { });
    }

    // TODO: Sends students to add to cohort and students to delete from cohort StudentInfo model
    // Updates the moodle cohorts - deletes and adds users 
    public updateMoodleData() {
        return this.http.post(`${this.uisApiUrl}`, {});
    }

}