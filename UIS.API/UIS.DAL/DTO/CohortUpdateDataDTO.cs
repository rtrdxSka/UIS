namespace UIS.DAL.DTO
{
    public class CohortUpdateDataDTO
    {
        public int CohortId { get; set; } 
        public List<StudentInfoDTO>? StudentsToRemoveFromCohort { get; set; }
        public List<StudentInfoDTO>? StudentsToAddToCohort { get; set; }
    }
}
