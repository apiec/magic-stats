using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Players.PlayerStats;

public class GetPlayer : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/{playerId}", Handle);

    public record PlayerWithStatsDto(string Id, string Name, bool IsGuest, PlayerStats Stats);

    public record PlayerStats(int Wins, int Games, float? Winrate, float? WinrateLast30);

    private record RawStats(int Id, string Name, bool IsGuest, int Games, int Wins, int WinsLast30);

    private static async Task<Results<Ok<PlayerWithStatsDto>, NotFound>> Handle(
        [FromRoute] string playerId,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var intId = int.Parse(playerId);
        var player = await dbContext.Players
            .AsNoTracking()
            .Where(p => p.Id == intId)
            .Select(pl => new RawStats(
                pl.Id,
                pl.Name,
                pl.IsGuest,
                pl.Participated.Count,
                pl.Participated.Count(p => p.Placement == 0),
                pl.Participated
                    .OrderByDescending(p => p.Game.PlayedAt)
                    .Take(30)
                    .Count(p => p.Placement == 0)))
            .SingleOrDefaultAsync(ct);

        if (player is null)
        {
            return TypedResults.NotFound();
        }

        var stats = new PlayerStats(
            Wins: player.Wins,
            Games: player.Games,
            Winrate: player.Games > 0 ? (float)player.Wins / player.Games : null,
            WinrateLast30: player.Games > 0 ? (float)player.WinsLast30 / Math.Min(player.Games, 30) : null);

        var response = new PlayerWithStatsDto(player.Id.ToString(), player.Name, player.IsGuest, stats);
        return TypedResults.Ok(response);
    }
}