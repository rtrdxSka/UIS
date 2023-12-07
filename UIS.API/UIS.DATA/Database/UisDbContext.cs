using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace UIS.DATA.Database
{
    public class UisDbContext : DbContext
    {
        private readonly IConfiguration _configuration;
        public UisDbContext(IConfiguration iconfig)
        {
            _configuration = iconfig;
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<StudentInfo>()
                .HasMany(s => s.DiscordData)
                .WithOne(e => e.StudentInfo)
                .HasForeignKey(e => e.StudentId)
                .IsRequired();


        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var connectionString = _configuration.GetConnectionString("uisStudent");
            optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
        }
        
        public DbSet<StudentInfo> Students { get; set; } = null!;
        public DbSet<DiscordData> DiscordData { get; set; } = null!;
    }
}
