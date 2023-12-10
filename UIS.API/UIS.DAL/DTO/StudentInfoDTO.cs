using CsvHelper.Configuration.Attributes;
using System.Text.Json.Serialization;

namespace UIS.DAL.DTO
{
    public class StudentInfoDTO
    {
        [JsonPropertyName("username")]
        [Name("username")]
        public string Username { get; set; }    

        [JsonPropertyName("firstname")]
        [Name("firstname")]
        public string FirstName { get; set; }

        [JsonPropertyName("middlename")]
        [Name("middlename")]
        public string MiddleName { get; set; }

        [JsonPropertyName("lastname")]
        [Name("lastname")]
        public string LastName { get; set; }

        [JsonPropertyName("email")]
        [Name("email")]
        public string Email { get; set; }

        [JsonPropertyName("cohort1")]
        [Name("cohort1")]
        public string Cohort1 { get; set; }
    }
}
