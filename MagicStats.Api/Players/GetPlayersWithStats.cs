using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Players;

public class GetPlayersWithStats : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/stats", Handle);

    public record Response(IReadOnlyCollection<PlayerWithStatsDto> Players);

    public record PlayerWithStatsDto(int Id, string Name, PlayerStats Stats);

    public record PlayerStats(int Wins, int Games, float? Winrate, float? WinrateLastX);

    private record RawStats(int Id, string Name, int Games, int Wins, int WinsLastX);

    private static async Task<Ok<Response>> Handle(
        [FromQuery] int? windowSize,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        windowSize ??= 10;
        var query = dbContext.Players
            .AsNoTracking()
            .Select(player => new RawStats(
                player.Id,
                player.Name,
                player.Participated.Count(),
                player.Participated.Count(part => part.Placement == 0),
                player.Participated
                    .OrderByDescending(part => part.Game.PlayedAt)
                    .Take(windowSize.Value)
                    .Count(part => part.Placement == 0)));

        var rawStats = await query.ToListAsync(ct);

        var dto = rawStats.Select(p =>
                new PlayerWithStatsDto(
                    p.Id,
                    p.Name,
                    new PlayerStats(
                        Wins: p.Wins,
                        Games: p.Games,
                        Winrate: p.Games > 0 ? (float)p.Wins / p.Games : null,
                        WinrateLastX: p.Games > 0 ? (float)p.WinsLastX / Math.Min(p.Games, windowSize.Value) : null)))
            .ToList();

        var response = new Response(dto);
        return TypedResults.Ok(response);
    }
}