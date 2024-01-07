using UIS.DATA;

public interface IStudentsRepository : IGenericRepository<StudentInfo>
{
    Task<StudentInfo?> GetStudentByUsernameAsync(string username);
}
