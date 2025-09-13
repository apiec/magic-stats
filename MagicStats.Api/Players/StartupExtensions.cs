using MagicStats.Api.Players.PlayerStats;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Players;

public static class StartupExtensions
{
    public static IEndpointRouteBuilder AddPlayerEndpoints(this IEndpointRouteBuilder app)
    {
        var endpoints = app
            .MapGroup("/players")
            .WithTags("players");

        endpoints.MapEndpoint<GetPlayers>();
        endpoints.MapEndpoint<GetPlayersWithStats>();
        endpoints.MapEndpoint<GetPlayersWinrates>();

        endpoints.MapEndpoint<CreatePlayer>();
        endpoints.MapEndpoint<DeletePlayer>();
        endpoints.MapEndpoint<UpdatePlayer>();

        endpoints.MapEndpoint<GetPlayer>();
        endpoints.MapEndpoint<GetPlayerCommanderStats>();
        endpoints.MapEndpoint<GetRecentGames>();
        endpoints.MapEndpoint<GetPlayerPods>();
        endpoints.MapEndpoint<GetRecordAgainstOtherPlayers>();

        return app;
    }
}