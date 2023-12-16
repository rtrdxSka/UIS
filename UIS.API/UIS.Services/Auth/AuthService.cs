using CsvHelper.Configuration;
using CsvHelper;
using System.Globalization;
using System.Text;
using UIS.DAL.Constants;
using UIS.DAL.DTO;
using UIS.DATA;

namespace UIS.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IStudentsRepository _studentsRepository;

        public AuthService(IStudentsRepository studentsRepository)
        {
            _studentsRepository = studentsRepository;
        }

        public async Task AddStudentToDb(StudentInfo studentInfo)
        {
            if (studentInfo == null)
            {
                throw new Exception();
            }

            await _studentsRepository.AddAsync(studentInfo);
            await _studentsRepository.SaveChangesAsync();
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

        public List<UISStudentInfoDTO> GetMockedUISStudentInfo()
        {
            // Refactor to get real data by making a request to the UIS API
            List<UISStudentInfoDTO> records = new List<UISStudentInfoDTO>();
            string mockedCSV = @"C:\Users\User\Desktop\uis.csv";

            // Ensure that the file is read with UTF-8 encoding
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HeaderValidated = null,
                HasHeaderRecord = true,
                Encoding = Encoding.UTF8
            };

            using (var reader = new StreamReader(mockedCSV, Encoding.UTF8))
            {
                using (var csv = new CsvReader(reader, config))
                {
                    records = csv.GetRecords<UISStudentInfoDTO>().ToList();
                }
            }

            return records;
        }
    }
}
