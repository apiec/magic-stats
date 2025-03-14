using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Games;

public class GetGame : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/{id:int}", Handle)
        .WithSummary("Get a game by id");


    private static async Task<Results<Ok<GameDto>, NotFound>> Handle(
        [FromRoute] int id,
        StatsDbContext dbContext,
        TimeProvider timeProvider,
        CancellationToken ct)
    {
        var game = await dbContext.Games
            .Include(g => g.Participants)
            .ThenInclude(p => p.Player)
            .Include(g => g.Participants)
            .ThenInclude(p => p.Commander)
            .Include(g => g.Host)
            .SingleOrDefaultAsync(g => g.Id == id, ct);

        return game is not null
            ? TypedResults.Ok(GameMapper.MapGame(game))
            : TypedResults.NotFound();
    }
}