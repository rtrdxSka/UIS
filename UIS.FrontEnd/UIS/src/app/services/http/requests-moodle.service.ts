import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

import { DataToUpdateCohort, MoodleCohort, StudentInfo } from "../../models/moodle";

export interface UpdateMoodleBody {
    data: StudentInfo[];
    cohortId: string;
}

@Injectable({
    providedIn: 'root',
})

export class RequestsMoodleService {

    constructor(private http: HttpClient) { }

    private moodleApiUrl = 'http://localhost/webservice/rest/server.php';
    private uisApiUrl = 'https://localhost:7059/api/Cohort';
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

    public getUpdatedCohortInfo(formData: FormData): Observable<DataToUpdateCohort[]> {
        return this.http.post<DataToUpdateCohort[]>(`${this.uisApiUrl}/SyncCohorts`, formData);
    }

    public removeStudentsFromCohort(body: UpdateMoodleBody) {
        return this.http.post(`${this.uisApiUrl}/RemoveStudentsFromCohort`, body);
    }

    public addStudentsToCohort(body: UpdateMoodleBody) {
        return this.http.post(`${this.uisApiUrl}/AddStudentsToCohort`, body);
    }

}
