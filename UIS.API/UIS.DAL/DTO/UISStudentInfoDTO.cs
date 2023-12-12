using CsvHelper.Configuration.Attributes;

namespace UIS.DAL.DTO
{
    public class UISStudentInfoDTO
    {
        [Name("Поща")]
        public string Email { get; set; }

        [Name("ОКС")]
        public string EQD { get; set; }

        [Name("КУРС")]
        public string Course { get; set; }

        [Name("Факултет")]
        public string Faculty { get; set; }

        [Name("Фак. Номер")]
        public string FacultyNumber { get; set; }

        [Name("Група")]
        public string Grouop { get; set; }

        [Name("Имена")]
        public string FullName { get; set; }

        [Name("Спец.")]
        public string Specialty { get; set; }
    }
}
