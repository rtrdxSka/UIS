using UIS.DAL.DTO;
using UIS.DATA;

namespace UIS.Services.Auth
{
    public interface IAuthService
    {
        Task<HttpResponseMessage> GetTokenAsync(HttpClient client, string code);
        Task<HttpResponseMessage> GetUserInfoAsync(HttpClient client, MoodleTokenDTO moodleToken);
        Task AddStudentToDb(StudentInfo studentInfo);
    }
}
