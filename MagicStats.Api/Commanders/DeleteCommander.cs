using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Commanders;

public class DeleteCommander : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapDelete("/{id:int}", Handle)
        .WithSummary("Deletes a commander");

    public record Request(int Id);

    private static async Task<Results<Ok, NotFound>> Handle(
        [AsParameters] Request request,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var rowsDeleted = await dbContext.Commanders
            .Where(x => x.Id == request.Id)
            .ExecuteDeleteAsync(ct);

        return rowsDeleted > 0
            ? TypedResults.Ok()
            : TypedResults.NotFound();
    }
}