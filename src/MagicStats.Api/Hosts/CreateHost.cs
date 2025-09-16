using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Hosts;

public class CreateHost : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPost("/", Handle)
        .WithSummary("Create a host");

    public record Request(string Name, bool Irl);

    private static async Task<Ok<HostDto>> Handle(
        Request request,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var host = new Host
        {
            Name = request.Name,
            Irl = request.Irl,
        };
        dbContext.Hosts.Add(host);
        await dbContext.SaveChangesAsync(ct);

        var response = new HostDto(host.Id.ToString(), host.Name, host.Irl);
        return TypedResults.Ok(response);
    }
}