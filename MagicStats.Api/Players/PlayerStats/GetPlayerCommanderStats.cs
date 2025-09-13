using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Players.PlayerStats;

public class GetPlayerCommanderStats : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/{playerId}/commanders", Handle);

    public record Response(CommanderStats[] Commanders);

    public record CommanderStats(string Name, int Games, int Wins, float Winrate);

    private static async Task<Results<Ok<Response>, NotFound>> Handle(
        [FromRoute] string playerId,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var intId = int.Parse(playerId);
        var player = await dbContext.Players.SingleOrDefaultAsync(p => p.Id == intId, ct);
        if (player is null)
        {
            return TypedResults.NotFound();
        }

        var rawStats = await dbContext.Participants
            .Where(p => p.Player.Id == intId)
            .GroupBy(p => p.Commander.Name)
            .Select(g => new
            {
                CommanderName = g.Key,
                TotalGames = g.Count(),
                Wins = g.Count(x => x.Placement == 0),
            })
            .ToArrayAsync(ct);

        var stats = rawStats.Select(x => new CommanderStats(
                x.CommanderName,
                x.TotalGames,
                x.Wins,
                (float)x.Wins / x.TotalGames))
            .ToArray();
        return TypedResults.Ok(new Response(stats));
    }
}