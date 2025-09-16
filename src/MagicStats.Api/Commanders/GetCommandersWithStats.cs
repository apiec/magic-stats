using MagicStats.Api.Games;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Commanders;

public class GetCommandersWithStats : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/stats", Handle);

    public record Response(IReadOnlyCollection<CommanderWithStatsDto> Commanders);

    public record CommanderWithStatsDto(CommanderDto Commander, CommanderStats Stats);

    public record CommanderStats(int Wins, int Games, float? Winrate);

    private static async Task<Ok<Response>> Handle(
        [FromQuery] int? windowSize,
        [FromQuery] int? podSize,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        windowSize ??= 10;

        var statsProvider = new CommanderStatsProvider(dbContext);
        var rawStats = podSize is null
            ? await statsProvider.GetAll(windowSize.Value, ct)
            : await statsProvider.GetByPodSize(podSize.Value, windowSize.Value, ct);

        var dto = rawStats.Select(p =>
                new CommanderWithStatsDto(
                    p.Commander.ToDto(),
                    new CommanderStats(
                        Wins: p.Wins,
                        Games: p.Games,
                        Winrate: p.Games > 0 ? (float)p.Wins / p.Games : null)))
            .ToList();

        var response = new Response(dto);
        return TypedResults.Ok(response);
    }

    private class CommanderStatsProvider(StatsDbContext dbContext)
    {
        public async Task<RawStats[]> GetAll(int windowSize, CancellationToken ct)
        {
            return await dbContext.Commanders
                .AsNoTracking()
                .Include(c => c.CommanderCard)
                .Include(c => c.PartnerCard)
                .Select(commander => new RawStats(
                    commander,
                    commander.Participated.Count,
                    commander.Participated.Count(p => p.Placement == 0),
                    commander.Participated
                        .OrderByDescending(p => p.Game.PlayedAt)
                        .Take(windowSize)
                        .Count(p => p.Placement == 0)))
                .ToArrayAsync(ct);
        }

        public async Task<RawStats[]> GetByPodSize(int podSize, int windowSize, CancellationToken ct)
        {
            var games = await dbContext.Games
                .Where(g => g.Participants.Count == podSize)
                .Include(g => g.Participants)
                .ThenInclude(p => p.Commander)
                .ThenInclude(p => p.CommanderCard)
                .Include(g => g.Participants)
                .ThenInclude(p => p.Commander)
                .ThenInclude(p => p.PartnerCard)
                .ToArrayAsync(ct);

            var commanders = games
                .SelectMany(g => g.Participants)
                .Select(p => p.Commander)
                .ToHashSet();

            return commanders
                .Select(commander => new RawStats(
                    commander,
                    commander.Participated.Count,
                    commander.Participated.Count(p => p.Placement == 0),
                    commander.Participated
                        .OrderByDescending(p => p.Game.PlayedAt)
                        .Take(windowSize)
                        .Count(p => p.Placement == 0)))
                .ToArray();
        }
    }

    private record RawStats(
        Commander Commander,
        int Games,
        int Wins,
        int WinsLastX);
}