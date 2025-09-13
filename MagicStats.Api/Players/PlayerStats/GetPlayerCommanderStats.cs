using MagicStats.Api.Games;
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

    public record Response(CommanderWithStatsDto[] Commanders);

    public record CommanderWithStatsDto(CommanderDto Commander, CommanderStats Stats);

    public record CommanderStats(int Wins, int Games, float Winrate);

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
            .GroupBy(p => p.CommanderId)
            .ToDictionaryAsync(
                g => g.Key, // CommanderId
                g => new
                {
                    Games = g.Count(),
                    Wins = g.Count(x => x.Placement == 0),
                },
                ct);

        var commanders = await dbContext.Commanders
            .Where(c => rawStats.Keys.Contains(c.Id))
            .Include(c => c.CommanderCard)
            .Include(c => c.PartnerCard)
            .ToArrayAsync(ct);

        var stats = commanders.Select(c =>
            {
                var stats = rawStats[c.Id];
                return new CommanderWithStatsDto(
                    c.ToDto(),
                    new CommanderStats(
                        stats.Games,
                        stats.Wins,
                        (float)stats.Wins / stats.Games));
            })
            .ToArray();
        return TypedResults.Ok(new Response(stats));
    }
}