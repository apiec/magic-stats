using MagicStats.Api.Games;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Players;

public class UpdatePlayer : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPut("/{playerId}", Handle)
        .WithSummary("Update a player");

    public record Request(string? Name, bool? IsGuest);

    private static async Task<Results<Ok<PlayerDto>, NotFound>> Handle(
        [FromRoute] string playerId,
        Request request,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var intId = int.Parse(playerId);
        var player = await dbContext.Players.SingleOrDefaultAsync(p => p.Id == intId, ct);
        if (player is null)
        {
            return TypedResults.NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            player.Name = request.Name;
        }

        if (request.IsGuest is not null)
        {
            player.IsGuest = request.IsGuest.Value;
        }

        await dbContext.SaveChangesAsync(ct);

        var response = new PlayerDto(player.Id.ToString(), player.Name, player.IsGuest);
        return TypedResults.Ok(response);
    }
}