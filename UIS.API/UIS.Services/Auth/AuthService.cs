using UIS.DAL.Constants;

namespace UIS.Services.Auth
{
    public class AuthService : IAuthService
    {
        public async Task<HttpResponseMessage> GetTokenAsync(HttpClient client, string code)
        {
            // Creates the POST request body for getting the token from moodle
            var content = new FormUrlEncodedContent(new[]
            {
                    new KeyValuePair<string, string>("code", code),
                    new KeyValuePair<string, string>("client_id", MoodleAuthConstants.ClientId),
                    new KeyValuePair<string, string>("client_secret", MoodleAuthConstants.ClientSecret),
                    new KeyValuePair<string, string>("grant_type", MoodleAuthConstants.GrantType),
                    new KeyValuePair<string, string>("scope", MoodleAuthConstants.Scope),
            });

            // Sends the POST request to the Moodle token endpoint
            var response = await client.PostAsync(MoodleAuthConstants.TokenUrl, content);

            return response;
        }
    }
}
