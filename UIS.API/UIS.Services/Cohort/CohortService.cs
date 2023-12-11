using CsvHelper.Configuration;
using CsvHelper;
using System.Globalization;
using System.Text;
using System.Text.Json;
using UIS.DAL.Constants;
using UIS.DAL.DTO;
using Microsoft.AspNetCore.Http;

namespace UIS.Services.Cohort
{
    public class CohortService : ICohortService
    {
        public async Task<List<CohortUpdateDataDTO>> ExtractMoodleSyncDataAsync(HttpClient client, string jwt, IFormFile csvFile)
        {
            var allMoodleCohorts = await GetMoodleCohortsAsync(client, jwt);
            var studentsFromCSVGroupedByCohorts = ExtractStudentDataByCohortsFromCSV(csvFile);

            List<CohortUpdateDataDTO> cohortsUpdateData = new List<CohortUpdateDataDTO>();

            // Iterates through every cohort in moodle
            foreach (var moodleCohort in allMoodleCohorts)
            {
                // vzima userIds
                // itererame vseki user i vzimame info za nego i go mahame dolu polse vuv foreacha
                // refactor da chekva za null

                // Takes the student ids from the given moodle cohort
                var studentIdsFromMoodle = await GetStudentsIDsFromMoodleCohortsAsync(client, moodleCohort.id, jwt);

                // If there are no students from the CSV file mathing the current cohort, skip the cohort iteration
                bool studentsFromCSVContainsCohort = studentsFromCSVGroupedByCohorts.ContainsKey(moodleCohort.name);
                if (studentsFromCSVContainsCohort == false)
                {
                    continue;
                }

                // Gets the students from the CSV matching the same cohort
                var studentsFromCsv = studentsFromCSVGroupedByCohorts[moodleCohort.name];

                // List of student ids from moodle, matching the given cohort
                var studentsIdsFromMoodle = studentIdsFromMoodle[0].userids ?? throw new Exception();

                var moodleUpdateData = await GetMoodleUpdateDataAsync(client, jwt, studentsIdsFromMoodle, studentsFromCsv, moodleCohort.name);
                moodleUpdateData.CohortId = moodleCohort.id;

                cohortsUpdateData.Add(moodleUpdateData);
            }

            return cohortsUpdateData;
        }

        public async Task<List<MoodleCohortsDTO>> GetMoodleCohortsAsync(HttpClient client, string jwt)
        {
            var content = new FormUrlEncodedContent(new[]
            {
                    new KeyValuePair<string, string>("wstoken", jwt),
                    new KeyValuePair<string, string>("wsfunction", "core_cohort_get_cohorts"),
                    new KeyValuePair<string, string>("moodlewsrestformat", "json")
            });

            var response = await client.PostAsync(MoodleAuthConstants.RestAPIUrl, content);
            List<MoodleCohortsDTO> allMoodleCohorts = new List<MoodleCohortsDTO>();

            if (response != null && response.IsSuccessStatusCode)
            {
                var getMoodleCohortsResponseContent = await response.Content.ReadAsStringAsync();
                allMoodleCohorts = JsonSerializer.Deserialize<List<MoodleCohortsDTO>>(getMoodleCohortsResponseContent);
            }

            return allMoodleCohorts;
        }

        public async Task<List<MoodleCohortUsersDTO>> GetStudentsIDsFromMoodleCohortsAsync(HttpClient client, int cohortId, string jwt)
        {
            var content = new FormUrlEncodedContent(new[]
            {
                    new KeyValuePair<string, string>("wstoken", jwt),
                    new KeyValuePair<string, string>("wsfunction", "core_cohort_get_cohort_members"),
                    new KeyValuePair<string, string>("moodlewsrestformat", "json"),
                    new KeyValuePair<string, string>("cohortids[]", cohortId.ToString())
            });

            var responseMessage = await client.PostAsync(MoodleAuthConstants.RestAPIUrl, content);
            var response = await responseMessage.Content.ReadAsStringAsync();
            var studentsFromMoodle = JsonSerializer.Deserialize<List<MoodleCohortUsersDTO>>(response);

            return studentsFromMoodle;
        }
        public async Task AddStudentToMoodleCohort(HttpClient client, string jwt, List<StudentInfoDTO> studentsToAddToCohort, string cohortId)
        {
            foreach (var student in studentsToAddToCohort)
            {
                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("wstoken", jwt),
                    new KeyValuePair<string, string>("wsfunction", "core_cohort_add_cohort_members"),
                    new KeyValuePair<string, string>("moodlewsrestformat", "json"),
                    new KeyValuePair<string, string>("members[0][cohorttype][type]", "id"),
                    new KeyValuePair<string, string>("members[0][cohorttype][value]", cohortId),
                    new KeyValuePair<string, string>("members[0][usertype][type]", "id"),
                    new KeyValuePair<string, string>("members[0][usertype][value]", student.Id),
                });

                await client.PostAsync(MoodleAuthConstants.RestAPIUrl, content);
            }
        }
        public async Task DeleteStudentsFromMoodleCohort(HttpClient client, string jwt, List<StudentInfoDTO> studentsRemovedFromCohort, string cohortId)
        {
            foreach (var student in studentsRemovedFromCohort)
            {
                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("wstoken", jwt),
                    new KeyValuePair<string, string>("wsfunction", "core_cohort_delete_cohort_members"),
                    new KeyValuePair<string, string>("moodlewsrestformat", "json"),
                    new KeyValuePair<string, string>("members[0][cohortid]", cohortId),
                    new KeyValuePair<string, string>("members[0][userid]", student.Id),
                });

                await client.PostAsync(MoodleAuthConstants.RestAPIUrl, content);
            }
        }
        public List<StudentInfoDTO> ExtractStudentDataFromCSV(IFormFile csvFile)
        {
            // Refactor to work with a csv that is received from POST request

            List<StudentInfoDTO> records = new List<StudentInfoDTO>();

            // Read the CSV file and map it to a list of StudentInfoDTO objects
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true, // The first row is the header
                Encoding = Encoding.UTF8 // Set the encoding
            };

            using (var reader = new StreamReader(csvFile.OpenReadStream()))
            using (var csv = new CsvReader(reader, config))
            {
                records = csv.GetRecords<StudentInfoDTO>().ToList();
            }

            return records;
        }

        public async Task<StudentInfoDTO?> GetUserByIdAsync(HttpClient client, int userId, string jwt)
        {
            var content = new FormUrlEncodedContent(new[]
            {
                    new KeyValuePair<string, string>("wstoken", jwt),
                    new KeyValuePair<string, string>("wsfunction", "core_user_get_users_by_field"),
                    new KeyValuePair<string, string>("moodlewsrestformat", "json"),
                    new KeyValuePair<string, string>("field", "id"),
                    new KeyValuePair<string, string>("values[0]", userId.ToString())
            });

            var responseMessage = await client.PostAsync(MoodleAuthConstants.RestAPIUrl, content);
            if (responseMessage.IsSuccessStatusCode)
            {
                var response = await responseMessage.Content.ReadAsStringAsync();
                var userInfo = JsonSerializer.Deserialize<List<StudentInfoDTO>>(response);

                return userInfo[0];
            }
            else
            {
                return null;
            }
        }

        private async Task<CohortUpdateDataDTO> GetMoodleUpdateDataAsync(HttpClient client, string jwt, List<int> studentsIdsFromMoodle, List<StudentInfoDTO> studentsFromCsv, string cohortName)
        {
            // If there is no cohort in moodle, add it?
            // Keeps a copy of the id of the students from moodle and removes a student from the list if he is present in the moodle CSV
            // If the list is not empty, the users inside are to be removed
            var trackStudentsToRemoveFromMoodle = studentsIdsFromMoodle.ToList();

            List<StudentInfoDTO> allStudents = new List<StudentInfoDTO>();

            foreach (var studentId in studentsIdsFromMoodle)
            {
                var student = await GetUserByIdAsync(client, studentId, jwt);
                allStudents.Add(student);
            }

            // Removes the students that are already in moodle from the lists of students from moodle and csv
            // If the student is in moodle but not in the csv -> delete student from the cohort
            foreach (var moodleStudentId in studentsIdsFromMoodle)
            {
                var moodleStudent = await GetUserByIdAsync(client, moodleStudentId, jwt);

                var isStudentAlreadyInMoodle = studentsFromCsv.FirstOrDefault(x => x.Username == moodleStudent.Username || x.Email == moodleStudent.Email);
                if (isStudentAlreadyInMoodle != null)
                {
                    // If the student from CSV is already in Moodle, remove the student from the current list of moodle and csv students
                    studentsFromCsv.Remove(isStudentAlreadyInMoodle);
                    trackStudentsToRemoveFromMoodle.Remove(moodleStudentId);
                }
            }

            List<StudentInfoDTO> studentsToRemoveFromCohort = new List<StudentInfoDTO>();

            // Gets the students that will be deleted from cohort
            foreach (var moodleStudentId in trackStudentsToRemoveFromMoodle)
            {
                var student = await GetUserByIdAsync(client, moodleStudentId, jwt);
                studentsToRemoveFromCohort.Add(student);
            }

            CohortUpdateDataDTO dataToUpdateMoodleDTO = new CohortUpdateDataDTO();
            dataToUpdateMoodleDTO.StudentsToRemoveFromCohort = studentsToRemoveFromCohort;
            dataToUpdateMoodleDTO.StudentsToAddToCohort = studentsFromCsv;
            dataToUpdateMoodleDTO.AllStudents = allStudents;
            dataToUpdateMoodleDTO.CohortName = cohortName;

            // Returns the list of students for upload and remove
            return dataToUpdateMoodleDTO;
        }

        private Dictionary<string, List<StudentInfoDTO>> ExtractStudentDataByCohortsFromCSV(IFormFile csvFile)
        {
            var unsortedRecords = ExtractStudentDataFromCSV(csvFile);

            // Groups the students by cohortId and sets the dictionary key to the cohortId
            var groupedRecords = unsortedRecords.GroupBy(s => s.Cohort1).ToDictionary(g => g.Key, g => g.ToList());

            return groupedRecords;
            return null;
        }
    }
}
