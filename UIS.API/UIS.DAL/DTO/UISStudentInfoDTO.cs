using CsvHelper.Configuration.Attributes;

namespace UIS.DAL.DTO
{
    public class UISStudentInfoDTO
    {
        [Name("Поща")]
        public string Email { get; set; }

        [Name("ОКС")]
        public string Oks { get; set; }

        [Name("КУРС")]
        public int Course { get; set; }

        [Name("Факултет")]
        public string Faculty { get; set; }

        [Name("Фак. Номер")]
        public string FacultyNumber { get; set; }

        [Name("Група")]
        public string Group { get; set; }

        [Name("Имена")]
        public string Names { get; set; }

        [Name("СПЕЦ.")]
        public string Specialty { get; set; }
    }
}
