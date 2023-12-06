namespace UIS.DAL.DTO
{
    public class MoodleCohortUsersDTO
    {
        // Refactor
        public int cohortid { get; set; }
        public List<int>? userids { get; set; }
    }
}
