using CsvHelper.Configuration.Attributes;

namespace UIS.DAL.DTO
{
    public class StudentInfoDTO
    {
        [Name("username")]
        public string Username { get; set; }

        [Name("firstname")]
        public string FirstName { get; set; }

        [Name("middlename")]
        public string MiddleName { get; set; }

        [Name("lastname")]
        public string LastName { get; set; }

        [Name("email")]
        public string Email { get; set; }

        [Name("cohort1")]
        public string Cohort1 { get; set; }
    }
}
