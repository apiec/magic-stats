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

    public record PlayerDto(int Id, string Name);

    private static async Task<Ok<Response>> Handle(StatsDbContext dbContext, CancellationToken ct)
    {
        var players = await dbContext.Players
            .Select(c => new PlayerDto(c.Id, c.Name))
            .AsNoTracking()
            .ToListAsync(ct);

        var response = new Response(players);
        return TypedResults.Ok(response);
    }
}