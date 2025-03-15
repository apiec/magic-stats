using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Commanders;

public class CreateCommander : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPost("/", Handle)
        .WithSummary("Create a commander");

    public record Request(string Name);
    public record Response(string Id);

    private static async Task<Ok<Response>> Handle(
        [FromBody] Request request,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var commander = new Commander
        {
            Name = request.Name,
        };
        dbContext.Commanders.Add(commander);
        await dbContext.SaveChangesAsync(ct);

        var response = new Response(commander.Id.ToString());
        return TypedResults.Ok(response);
    }
}