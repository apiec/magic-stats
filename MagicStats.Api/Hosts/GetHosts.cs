using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Hosts;

public class GetHosts : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/", Handle);

    public record Response(IReadOnlyCollection<HostDto> Hosts);

    public record HostDto(int Id, string Name, bool Irl);

    private static async Task<Ok<Response>> Handle(StatsDbContext dbContext, CancellationToken ct)
    {
        var hosts = await dbContext.Hosts
            .OrderBy(h => h.Name)
            .Select(h => new HostDto(h.Id, h.Name, h.Irl))
            .AsNoTracking()
            .ToListAsync(ct);

        var response = new Response(hosts);
        return TypedResults.Ok(response);
    }
}