using UIS.DATA;
using UIS.DATA.Database;

public class StudentsRepository : GenericRepository<StudentInfo>
{
    public StudentsRepository(UisDbContext context) : base(context) { }
}
