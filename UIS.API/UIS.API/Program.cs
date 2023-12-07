
using Microsoft.EntityFrameworkCore;
using UIS.DATA.Database;
using UIS.Services.Auth;
using UIS.Services.Cohort;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddTransient<IAuthService, AuthService>();
builder.Services.AddTransient<ICohortService, CohortService>();

builder.Services.AddControllers();
builder.Services.AddDbContext<UisDbContext>(options =>
        options.UseMySql(ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("uisStudent"))));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options => options.AddPolicy(name: "UIS",
    policy =>
    {
        policy.WithOrigins("http://localhost:4200/").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
    }));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("UIS");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

