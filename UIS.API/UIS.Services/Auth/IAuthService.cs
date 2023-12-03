namespace UIS.Services.Auth
{
    public interface IAuthService
    {
        Task<HttpResponseMessage> GetTokenAsync(HttpClient client, string code);
    }
}
