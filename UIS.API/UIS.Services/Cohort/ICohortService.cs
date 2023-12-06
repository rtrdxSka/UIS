using UIS.DAL.DTO;

namespace UIS.Services.Cohort
{
    public interface ICohortService
    {
        Task<List<CohortUpdateDataDTO>> ExtractMoodleSyncDataAsync(HttpClient client, string jwt);
        Task<List<MoodleCohortsDTO>> GetMoodleCohortsAsync(HttpClient client, string jwt);
        Task<List<MoodleCohortUsersDTO>> GetStudentsIDsFromMoodleCohortsAsync(HttpClient client, int cohortId, string jwt);
        List<StudentInfoDTO> ExtractStudentDataFromCSV();
        Task<StudentInfoDTO?> GetUserByIdAsync(HttpClient client, int userId, string jwt);
    }
}
