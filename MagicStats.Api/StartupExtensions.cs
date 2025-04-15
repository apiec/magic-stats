using MagicStats.Api.Commanders;
using MagicStats.Api.Games;
using MagicStats.Api.Home;
using MagicStats.Api.Hosts;
using MagicStats.Api.Migration;
using MagicStats.Api.Players;
using MagicStats.Api.Pods;
using MagicStats.Api.Shared;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace MagicStats.Api;

public static class StartupExtensions
{
    public static IServiceCollection AddMagicStatsApi(this IServiceCollection services)
    {
        return services;
    }

    public static IApplicationBuilder UseMagicStatsApi(this WebApplication app)
    {
        var endpoints = app
            .MapGroup("/api")
            .WithOpenApi();

        endpoints.AddHomeEndpoints();
        endpoints.AddCommanderEndpoints();
        endpoints.AddPlayerEndpoints();
        endpoints.AddHostsEndpoints();
        endpoints.AddGameEndpoints();
        endpoints.AddPodsEndpoints();
        endpoints.AddMigrationEndpoints();

        return app;
    }

    internal static IEndpointRouteBuilder MapEndpoint<TEndpoint>(this IEndpointRouteBuilder app)
        where TEndpoint : IEndpoint
    {
        TEndpoint.Map(app);
        return app;
    }
}