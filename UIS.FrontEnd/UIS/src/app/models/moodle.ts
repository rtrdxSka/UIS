export interface StudentInfo {
    username: string;
    email: string;
    cohort1: string;
    firstname: string;
    middlename: string;
    lastname: string;
}

export interface MoodleCohort {
    cohortid: number;
    userids: number[];
}

export interface DataToUpdateCohort {
    cohortId: string;
    cohortName: string;
    allStudents: StudentInfo[];
    studentsToAddToCohort: StudentInfo[];
    studentsToRemoveFromCohort: StudentInfo[];
}
