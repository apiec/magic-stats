using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Games;

public class DeleteGame : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapDelete("/{id}", Handle)
        .WithSummary("Delete a game");

    private static async Task<Results<Ok, NotFound>> Handle(
        [FromRoute] string id,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var intId = int.Parse(id);
        var rowsDeleted = await dbContext.Games
            .Where(g => g.Id == intId)
            .ExecuteDeleteAsync(ct);
        
        return rowsDeleted > 0
            ? TypedResults.Ok()
            : TypedResults.NotFound();
    }
}