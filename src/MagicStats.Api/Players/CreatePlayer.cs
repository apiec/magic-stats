using MagicStats.Api.Games;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Players;

public class CreatePlayer : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPost("/", Handle)
        .WithSummary("Create a player");

    public record Request(string Name, bool IsGuest);

    private static async Task<Ok<PlayerDto>> Handle(
        Request request,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var player = new Player
        {
            Name = request.Name,
            IsGuest = request.IsGuest,
        };
        dbContext.Players.Add(player);
        await dbContext.SaveChangesAsync(ct);

        var response = player.ToDto();
        return TypedResults.Ok(response);
    }
}