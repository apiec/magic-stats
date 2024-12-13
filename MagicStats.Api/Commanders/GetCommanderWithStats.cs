using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Commanders;

public class GetCommandersWithStats : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/stats", Handle);

    public record Response(IReadOnlyCollection<CommanderWithStatsDto> Commanders);

    public record CommanderWithStatsDto(int Id, string Name, CommanderStats Stats);

    public record CommanderStats(int Wins, int Games, float? Winrate, float? WinrateLast10);

    private record RawStats(int Id, string Name, int Games, int Wins, int WinsLast10);

    private static async Task<Ok<Response>> Handle(StatsDbContext dbContext, CancellationToken ct)
    {
        var query = dbContext.Commanders
            .AsNoTracking()
            .Select(commander => new RawStats(
                commander.Id,
                commander.Name,
                commander.Participated.Count(),
                commander.Participated.Count(part => part.Placement == 0),
                commander.Participated
                    .OrderByDescending(part => part.Game.PlayedAt)
                    .Take(10)
                    .Count(part => part.Placement == 0)));

        var rawStats = await query.ToListAsync(ct);

        var dto = rawStats.Select(p =>
                new CommanderWithStatsDto(
                    p.Id,
                    p.Name,
                    new CommanderStats(
                        Wins: p.Wins,
                        Games: p.Games,
                        Winrate: p.Games > 0 ? (float)p.Wins / p.Games : null,
                        WinrateLast10: p.Games > 0 ? (float)p.WinsLast10 / Math.Min(p.Games, 10) : null)))
            .ToList();

        var response = new Response(dto);
        return TypedResults.Ok(response);
    }
}