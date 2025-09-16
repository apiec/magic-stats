using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Players;

public class DeletePlayer : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapDelete("/{id}", Handle)
        .WithSummary("Deletes a player");

    public record Request(string Id);

    private static async Task<Results<Ok, NotFound>> Handle(
        [FromRoute] string id,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var intId = int.Parse(id);
        var rowsDeleted = await dbContext.Players
            .Where(x => x.Id == intId)
            .ExecuteDeleteAsync(ct);

        return rowsDeleted > 0
            ? TypedResults.Ok()
            : TypedResults.NotFound();
    }
}