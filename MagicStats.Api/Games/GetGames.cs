using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
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
        StatsDbContext dbContext,
        TimeProvider timeProvider,
        CancellationToken ct)
    {
        var games = await dbContext.Games
            .Include(g => g.Participants)
            .ThenInclude(p => p.Player)
            .Include(g => g.Participants)
            .ThenInclude(p => p.Commander)
            .Include(g => g.Host)
            .OrderByDescending(g => g.PlayedAt)
            .ToListAsync(ct);

        var response = new Response(games.Select(GameMapper.MapGame));

        return TypedResults.Ok(response);
    }

}