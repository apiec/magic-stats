using MagicStats.Api.Games.Participants;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Games;

internal static class StartupExtensions
{
    public static IEndpointRouteBuilder AddGameEndpoints(this IEndpointRouteBuilder app)
    {
        var endpoints = app
            .MapGroup("/games")
            .WithTags("games");

        endpoints.MapEndpoint<CreateGame>();
        endpoints.MapEndpoint<DeleteGame>();
        endpoints.MapEndpoint<UpdateGame>();

        endpoints.MapEndpoint<AddParticipant>();
        endpoints.MapEndpoint<RemoveParticipant>();
        endpoints.MapEndpoint<UpdateParticipantPlacements>();
        endpoints.MapEndpoint<UpdateParticipantStartingOrder>();

        return app;
    }
}