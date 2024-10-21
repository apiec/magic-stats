using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Games;

public class UpdateGame : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPut("/{id:int}", Handle)
        .WithName("Update game");

    public record Request(DateTimeOffset PlayedAt);

    private static async Task<Results<Ok, NotFound>> Handle(
        [FromRoute] int id,
        [FromBody] Request request,
        StatsDbContext dbContext,
        TimeProvider timeProvider,
        CancellationToken ct)
    {
        var game = await dbContext.Games
            .SingleOrDefaultAsync(g => g.Id == id, ct);

        if (game is null)
        {
            return TypedResults.NotFound();
        }

        game.PlayedAt = request.PlayedAt;
        game.LastModified = timeProvider.GetUtcNow();

        dbContext.Update(game);
        await dbContext.SaveChangesAsync(ct);
        return TypedResults.Ok();
    }
}