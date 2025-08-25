using MagicStats.Api;
using MagicStats.Persistence.EfCore;
using Microsoft.AspNetCore.Http.Features;

var config = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
    .Build();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddHttpLogging(o => { });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => { options.CustomSchemaIds(type => type.FullName?.Replace("+", ".")); });
builder.Services.AddSingleton(TimeProvider.System);

builder.Services.AddPersistenceEfCore(config);
builder.Services.AddMagicStatsApi();
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 200 * 1024 * 1024; // 200MBi for the scryfall input data
});

var app = builder.Build();

app.UseHttpLogging();
app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseMagicStatsApi();

app.MapFallbackToFile("/index.html");
app.Run();