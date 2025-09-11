using MagicStats.Api.Commanders.Cards;
using MagicStats.Api.Commanders.CommanderStats;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Commanders;

internal static class StartupExtensions
{
    public static IEndpointRouteBuilder AddCommanderEndpoints(this IEndpointRouteBuilder app)
    {
        var endpoints = app
            .MapGroup("/commanders")
            .WithTags("commanders");

        // Commanders
        endpoints.MapEndpoint<GetCommanders>();
        endpoints.MapEndpoint<GetCommandersWithStats>();
        endpoints.MapEndpoint<GetCommandersWinrates>();

        endpoints.MapEndpoint<CreateCommander>();
        endpoints.MapEndpoint<DeleteCommander>();

        // CommanderStats
        endpoints.MapEndpoint<GetCommander>();

        // Cards
        endpoints.MapEndpoint<GetCommanderCards>();

        return app;
    }
}