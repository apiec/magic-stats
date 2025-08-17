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

public class GetRecentGames : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/{playerId}/recentGames", Handle);

    public record Response(RecentGameDto[] RecentGames);

    public record RecentGameDto(string GameId, DateTimeOffset PlayedAt, CommanderDto Commander, int Placement);

    private static async Task<Results<Ok<Response>, NotFound>> Handle(
        [FromRoute] string playerId,
        [FromQuery] int count,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var intId = int.Parse(playerId);
        var playerExists = await dbContext.Players.AnyAsync(p => p.Id == intId, ct);
        if (!playerExists)
        {
            return TypedResults.NotFound();
        }

        var recentGames = await dbContext.Players
            .Where(p => p.Id == intId)
            .SelectMany(p => p.Participated)
            .OrderByDescending(p => p.Game.PlayedAt)
            .Take(count)
            .Select(p => new { p.GameId, p.Game.PlayedAt, p.Commander, p.Placement })
            .ToArrayAsync(ct);

        var response = new Response(
            recentGames.Select(g => new RecentGameDto(
                    g.GameId.ToString(),
                    g.PlayedAt,
                    g.Commander.ToDto(),
                    g.Placement))
                .ToArray());

        return TypedResults.Ok(response);
    }
}