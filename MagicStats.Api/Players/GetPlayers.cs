using MagicStats.Api.Games;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Players;

public class GetPlayers : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/", Handle);

    public record Response(IReadOnlyCollection<PlayerDto> Players);

    private static async Task<Ok<Response>> Handle(StatsDbContext dbContext, CancellationToken ct)
    {
        var players = await dbContext.Players
            .OrderBy(p => p.Name)
            .Select(p => new PlayerDto(p.Id.ToString(), p.Name, p.IsGuest))
            .AsNoTracking()
            .ToListAsync(ct);

        var response = new Response(players);
        return TypedResults.Ok(response);
    }
}