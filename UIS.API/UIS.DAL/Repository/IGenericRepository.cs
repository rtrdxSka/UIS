public interface IGenericRepository<TEntity> where TEntity : class
{
    TEntity? GetById(int id);
    IEnumerable<TEntity> GetAll();
    void Add(TEntity entity);
    Task AddAsync(TEntity entity);
    void Delete(TEntity entity);
    Task SaveChangesAsync();
}