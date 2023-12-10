using UIS.Services.Auth;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using UIS.DAL.DTO;

namespace UIS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class UserController : ControllerBase{

      private readonly IAuthService _authService;

        public UserController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpGet("discord-info")]
        public async Task<IActionResult> HandleMoodleAuthCallbackAsync(string code, string discord_id, string guild_id)
 {

     using (var client = new HttpClient())
     {
         // Sends request to moodle for the authentication token
         var AuthResponse = await _authService.GetTokenAsync(client, code);

         if (AuthResponse.IsSuccessStatusCode)
         {
             var AuthResponseContent = await AuthResponse.Content.ReadAsStringAsync();

             MoodleTokenDTO moodleToken = JsonSerializer.Deserialize<MoodleTokenDTO>(AuthResponseContent);

             // Sends request to moodle for the authenticated user's info
             var UserInfoResponse = await _authService.GetUserInfoAsync(client, moodleToken);

             if (UserInfoResponse.IsSuccessStatusCode)
             {
                 // Deserialise the user info
                 var UserInfoResponseContent = await UserInfoResponse.Content.ReadAsStringAsync();
                 UserInfoDTO userInfo = JsonSerializer.Deserialize<UserInfoDTO>(UserInfoResponseContent);

                 if (userInfo != null)
                 {
                     var content = new FormUrlEncodedContent(new[]
                     {
                         new KeyValuePair<string, string>("firstname", userInfo.firstname),
                         new KeyValuePair<string, string>("lastname",userInfo.lastname),
                         new KeyValuePair<string, string>("faculty_number","1"),
                         new KeyValuePair<string, string>("discord_id",discord_id),
                         new KeyValuePair<string, string>("guild_id",guild_id)
                     });

                     await client.PostAsync("http://localhost:4200/api/User/discord-info", content);

                     return Redirect("https://www.google.com/");
                 }

                 
             }

         }
         return BadRequest();

     }

 }
    }

 
}