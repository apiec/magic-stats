using MagicStats.Persistence.EfCore.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MagicStats.Persistence.EfCore;

public static class StartupExtensions
{
    public static IServiceCollection AddPersistenceEfCore(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("sqlite");
        services.AddDbContext<StatsDbContext>(options => options.UseSqlite(connectionString));

        return services;
    }
}