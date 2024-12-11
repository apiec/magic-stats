using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Players;

public class GetPlayersWithStats : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/stats", Handle);

    public record Response(IReadOnlyCollection<PlayerWithStatsDto> Players);

    public record PlayerWithStatsDto(int Id, string Name, PlayerStats Stats);

    public record PlayerStats(int Wins, int Games, float? Winrate, float? WinrateLast10);

    private record RawStats(int Id, string Name, int Games, int Wins, int WinsLast10);

    private static async Task<Ok<Response>> Handle(StatsDbContext dbContext, CancellationToken ct)
    {
        var query = dbContext.Players
            .AsNoTracking()
            .Select(player => new RawStats(
                player.Id,
                player.Name,
                player.Participated.Count(),
                player.Participated.Count(part => part.Placement == 0),
                player.Participated.OrderBy(part => part.Game.PlayedAt).Take(10).Count(part => part.Placement == 0)));

        var rawStats = await query.ToListAsync(ct);

        var dto = rawStats.Select(p =>
                new PlayerWithStatsDto(
                    p.Id,
                    p.Name,
                    new PlayerStats(
                        Wins: p.Wins,
                        Games: p.Games,
                        Winrate: p.Games > 0 ? (float)p.Wins / p.Games : null,
                        WinrateLast10: p.Games > 0 ? (float)p.WinsLast10 / Math.Min(p.Games, 10) : null)))
            .ToList();

        var response = new Response(dto);
        return TypedResults.Ok(response);
    }
}