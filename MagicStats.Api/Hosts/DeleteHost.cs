using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Hosts;

public class DeleteHost : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapDelete("/{id:int}", Handle)
        .WithSummary("Deletes a host");

    public record Request(int Id);

    private static async Task<Results<Ok, NotFound>> Handle(
        [AsParameters] Request request,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var rowsDeleted = await dbContext.Hosts
            .Where(x => x.Id == request.Id)
            .ExecuteDeleteAsync(ct);

        return rowsDeleted > 0
            ? TypedResults.Ok()
            : TypedResults.NotFound();
    }
}