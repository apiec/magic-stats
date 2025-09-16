using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Hosts;

public class GetHostsWithStats : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/stats", Handle);

    public record Response(IReadOnlyCollection<HostWithStatsDto> Hosts);

    public record HostWithStatsDto(string Id, string Name, bool Irl, int Games);

    private static async Task<Results<Ok<Response>, BadRequest>> Handle(
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var dtos = await dbContext.Hosts
            .Select(host => new HostWithStatsDto(
                host.Id.ToString(),
                host.Name,
                host.Irl,
                host.Games.Count))
            .ToListAsync(ct);

        var response = new Response(dtos);
        return TypedResults.Ok(response);
    }
}