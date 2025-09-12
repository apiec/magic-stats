using MagicStats.Api.Games;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Commanders;

public class GetCommanders : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/", Handle);

    public record Response(IReadOnlyCollection<CommanderDto> Commanders);

    private static async Task<Ok<Response>> Handle(StatsDbContext dbContext, CancellationToken ct)
    {
        var commanders = await dbContext.Commanders
            .AsNoTracking()
            .Include(c => c.CommanderCard)
            .OrderBy(c => c.Name)
            .Select(c => c.ToDto())
            .ToListAsync(ct);
        
        var response = new Response(commanders);
        return TypedResults.Ok(response);
    }
}