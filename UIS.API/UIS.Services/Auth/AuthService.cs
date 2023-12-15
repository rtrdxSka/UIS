using UIS.DAL.Constants;
using UIS.DAL.DTO;

namespace UIS.Services.Auth
{
    public class AuthService : IAuthService
    {
        
        private readonly HttpClient _client;

        public AuthService(HttpClient client)
        {
            _client = client;
        }
        
        private readonly HttpMessageHandler _httpMessageHandler;

        public AuthService(HttpMessageHandler httpMessageHandler)
        {
            _httpMessageHandler = httpMessageHandler;
        }
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

        public async Task<HttpResponseMessage> GetUserInfoAsync(HttpClient client, MoodleTokenDTO moodleToken)
        {
            // Creates the POST request body for getting the user info from moodle
            var access_token = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("access_token", moodleToken.AccessToken)
            });

            // Sends the POST request to the Moodle user info endpoint
            var userInfo = await client.PostAsync(MoodleAuthConstants.UserInfoUrl, access_token);

            return userInfo;
        }
    }
}
