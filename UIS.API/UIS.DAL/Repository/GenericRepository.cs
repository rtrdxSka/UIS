using Microsoft.EntityFrameworkCore;
using UIS.DATA.Database;

public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class
{
    protected readonly UisDbContext _context;

    public GenericRepository(UisDbContext context)
    {
        _context = context;
    }

    public void Add(TEntity entity)
    {
        DbSet.Add(entity);
    }

    public async Task AddAsync(TEntity entity)
    {
        await DbSet.AddAsync(entity);
    }

    public void Delete(TEntity entity)
    {
        DbSet.Remove(entity);
    }

    public IEnumerable<TEntity> GetAll()
    {
        return DbSet.ToList();
    }

    public TEntity? GetById(int id)
    {
        return DbSet.Find(id);
    }

    public Task SaveChangesAsync() => _context.SaveChangesAsync();

    protected DbSet<TEntity> DbSet => _context.Set<TEntity>();
}