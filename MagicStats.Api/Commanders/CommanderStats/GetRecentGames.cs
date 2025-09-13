using MagicStats.Api.Games;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Commanders.CommanderStats;

public class GetRecentGames : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/{commanderId}/recentGames", Handle);

    public record Response(RecentGameDto[] RecentGames);

    public record RecentGameDto(string GameId, DateTimeOffset PlayedAt, int PodSize, int Placement);

    private static async Task<Results<Ok<Response>, NotFound>> Handle(
        [FromRoute] string commanderId,
        [FromQuery] int count,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var intId = int.Parse(commanderId);
        var commanderExists = await dbContext.Commanders.AnyAsync(p => p.Id == intId, ct);
        if (!commanderExists)
        {
            return TypedResults.NotFound();
        }

        var recentGames = await dbContext.Commanders
            .Where(p => p.Id == intId)
            .SelectMany(p => p.Participated)
            .OrderByDescending(p => p.Game.PlayedAt)
            .Take(count)
            .Select(p => new
            {
                p.GameId,
                p.Game.PlayedAt,
                PodSize = p.Game.Participants.Count,
                p.Placement,
            })
            .ToArrayAsync(ct);

        var response = new Response(
            recentGames.Select(g => new RecentGameDto(
                    g.GameId.ToString(),
                    g.PlayedAt,
                    g.PodSize,
                    g.Placement))
                .ToArray());

        return TypedResults.Ok(response);
    }
}