using UIS.Services.Auth;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using UIS.DAL.DTO;
using HtmlAgilityPack;


namespace UIS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {

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

                        string htmlContent = @"
                                    <!DOCTYPE html>
                                    <html class=' abtuvgbdw idc0_343' lang='bg'><head>
                                    <meta http-equiv='content-type' content='text/html; charset=UTF-8'>
                                    <meta charset='utf-8'>
                                    <meta http-equiv='cache-control' content='no-cache'>
                                    <meta http-equiv='expires' content='-1'>
                                    <meta http-equiv='pragma' content='no-cache'>

                                    <meta content='ТУ - София' name='title'>

                                    <meta content='education' name='classification'>
                                    <meta content='index, follow' name='robots'>
                                    <meta content='noarchive' name='googlebot'>
                                    <meta content='10 days' name='revisit-after'>

                                    <meta content='Технически университет-София (е-унижерситет)' name='author'>
                                    <meta content='lup@tu-sofia.bg' name='reply-to'>
                                    <meta content='Copyright © 2021-2021 Технически университет-София, ALL RIGHTS RESERVED.' name='copyright'>
                                    <meta content='global' name='distribution'>
                                    <meta content='general' name='rating'>
                                    <meta content='2003-04-25' name='pubdate'>
                                    <meta content='Технически университет-София' name='owner'>

                                    <link type='image/x-icon' href='https://e-university.tu-sofia.bg/phpExcell/TU_Logo.png' rel='icon'>
                                    <link type='image/x-icon' href='https://e-university.tu-sofia.bg/phpExcell/TU_Logo.png' rel='shortcut icon'>
                                    </head>

                                    <body>

                                    <style type='text/css'>
                                    .tableFixHead          { overflow-y: auto; height: 600px; width: 95%}
                                    .tableFixHead thead th { position: sticky; top: 0; }

                                    /* Just common table stuff. Really. */
                                    table  { border-collapse: collapse; width: 100%; }
                                    th, td { padding: 8px 16px; }
                                    th     { background:#eee; }

                                    /* Borders (if you need them) */
                                    .tableFixHead,
                                    .tableFixHead td {
                                        box-shadow: inset 1px -1px #000;
                                    }
                                    .tableFixHead th {
                                        box-shadow: inset 1px 1px #000, 0 1px #000;
                                    }
                                    </style>

                                    <div class='tableFixHead'>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Поща</th><th>ОКС</th><th>КУРС</th><th>Факултет</th><th>Фак. №</th><th>Група</th><th>Имена</th><th>СПЕЦ.</th><th>Статус</th>
                                                </tr>
                                            </thead>
                                            <tbody><tr>
                                                <td><strong>kmitev@tu-sofia.bg</strong></td>
                                                <td>Магистър</td> 
                                                <td>3</td>
                                                <td>ФПМИ</td>
                                                <td>471221041</td>
                                                <td>78</td>
                                                <td>КРИСТИЯН МИХАЙЛОВ МИТЕВ</td>
                                                <td>ИСН</td>
                                                <td>$12Действащ</td>
                                            </tr>
                                            </tbody></table>
                                    </div>
                                    <br><br>

                                    <form method='post'>
                                        <table style='border: 1px solid;'>
                                            <tbody><tr><td colspan='2' align='center'>Файл, оставете това поле празно, за да видите резултата на екрана</td></tr>
                                            <tr><td colspan='2' align='center'><input type='text' name='fname'></td></tr>
                                            <tr><td colspan='2'><hr></td></tr>
                                            <tr><td colspan='2' align='center'>Само редовни <input type='radio' value='1' name='redovni'>  Всички <input type='radio' value='2' name='redovni' checked='checked'></td></tr>
                                            <tr><td colspan='2' align='center'><hr>Фак №, ако се въведе ще се използва само той! </td></tr>
                                            <tr><td colspan='2' align='center'><input type='text' name='fn' value='471221041'></td></tr>
                                            <tr><td colspan='2'><hr></td></tr>
                                            <tr><td align='right'>Факултет:</td><td><select name='fak' title='Факултет'>
                                                        <option value='ДФВС' selected='selected'>Департамент за физическо възпитание и спорт</option>
                                                        ... // add other options here
                                                    </select></td></tr>
                                            <tr><td align='right'>Курсове:<br>Списък разделен с ',' (1,3..) или * за всчики</td><td><input type='text' name='kurs'></td></tr>
                                            <tr><td align='right'>Групи:<br>Списък разделен с ',' (22,33,4..) или * за всички</td><td><input type='text' name='groups'></td></tr>
                                            <tr><td align='right'>ОКС:<br>Може да изберете няколко с 'Ctrl'<br>или нищо за да се изведат всички</td><td><select name='oks[]' multiple='multiple' size='9'>
                                                        <option value='10'>Магистър след ПБ - 2 год.</option>
                                                        ... // add other options here
                                                    </select></td></tr>
                                        </tbody></table>
                                        <br>
                                        <input type='submit' name='make' value='Справка'><br>
                                    </form>
                                    </body></html>";

                        // Now you can use htmlContent as a variable containing your HTML code
                        var htmlDoc = new HtmlDocument();
                        htmlDoc.LoadHtml(htmlContent);
                        var degree = "";
                        var major = "";

                        var node = htmlDoc.DocumentNode.SelectSingleNode("//tbody/tr[1]/td[2]");
                        var node_2 = htmlDoc.DocumentNode.SelectSingleNode("//tbody/tr[1]/td[8]");

                        if (node != null)
                        {
                            degree = node.InnerText.Trim();
                        }
                        else
                        {
                            Console.WriteLine("Node not found.");
                        }


                        if (node_2 != null)
                        {
                            major = node_2.InnerText.Trim();
                        }
                        else
                        {
                            Console.WriteLine("Node not found.");
                        }

                        if (userInfo != null)
<<<<<<< HEAD
                 {
                     var content = new FormUrlEncodedContent(new[]
                     {
                         new KeyValuePair<string, string>("firstname", userInfo.firstname),
                         new KeyValuePair<string, string>("lastname",userInfo.lastname),
                         new KeyValuePair<string, string>("course_number","1"),
                         new KeyValuePair<string, string>("discord_id",discord_id),
                         new KeyValuePair<string, string>("guild_id",guild_id),
                         new KeyValuePair<string, string>("degree", degree),
                         new KeyValuePair<string, string>("major", major),
                         new KeyValuePair<string, string>("faculty_number", userInfo.username)
=======             })
                        
                         

                            await client.PostAsync("http://localhost:4200/api/User/discord-info", content);

                            return Redirect("https://www.google.com/")                        
                    }
                }
            }
            return BadRequest();
        }

        [HttpGet]
        public async Task<ActionResult<List<UISStudentInfoDTO>>> GetStudentDataFromUISAsync()
        {
            // Refactor to get filtered data when making requests to UIS
            var studentInfo = _authService.GetMockedUISStudentInfo();

            return Ok(studentInfo);
        }
    }
}