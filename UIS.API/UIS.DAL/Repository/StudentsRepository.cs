using Microsoft.EntityFrameworkCore;

using UIS.DATA;
using UIS.DATA.Database;

public class StudentsRepository : GenericRepository<StudentInfo>, IStudentsRepository
{
    public StudentsRepository(UisDbContext context) : base(context) { }

    public async Task<StudentInfo?> GetStudentByUsernameAsync(string username)
    {
        return await DbSet.FirstOrDefaultAsync(x => x.Username == username);
    }
}
