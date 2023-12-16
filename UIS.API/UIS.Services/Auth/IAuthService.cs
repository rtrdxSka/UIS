using UIS.DAL.DTO;

namespace UIS.Services.Auth
{
    public interface IAuthService
    {
        Task<HttpResponseMessage> GetTokenAsync(HttpClient client, string code);
        Task<HttpResponseMessage> GetUserInfoAsync(HttpClient client, MoodleTokenDTO moodleToken);
        List<UISStudentInfoDTO> GetMockedUISStudentInfo();
    }
}
