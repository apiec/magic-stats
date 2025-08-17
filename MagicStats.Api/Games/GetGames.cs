using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Games;

public class GetGames : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/", Handle)
        .WithSummary("Get all games");

    public record Response(IEnumerable<GameDto> Games);

    private static async Task<Ok<Response>> Handle(
        [FromQuery] string? playerId,
        [FromQuery] int? count,
        [FromQuery] int? page,
        StatsDbContext dbContext,
        TimeProvider timeProvider,
        CancellationToken ct)
    {
        var query = dbContext.Games.AsQueryable();
        if (playerId is not null)
        {
            var intId = int.Parse(playerId);
            query = query.Where(g => g.Participants.Any(p => p.PlayerId == intId));
        }

        query = query
            .Include(g => g.Participants)
            .ThenInclude(p => p.Player)
            .Include(g => g.Participants)
            .ThenInclude(p => p.Commander)
            .Include(g => g.Host)
            .OrderByDescending(g => g.PlayedAt);

        if (page is not null && count is not null)
        {
            query = query.Skip(page.Value * count.Value);
        }

        if (count is not null)
        {
            query = query.Take(count.Value);
        }

        var games = await query.ToListAsync(ct);
        var response = new Response(games.Select(GameMapper.MapGame));

        return TypedResults.Ok(response);
    }
}