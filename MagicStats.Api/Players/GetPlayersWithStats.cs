using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Players;

public class GetPlayersWithStats : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/stats", Handle);

    public record Response(IReadOnlyCollection<PlayerWithStatsDto> Players);

    public record PlayerWithStatsDto(int Id, string Name, PlayerStats Stats);

    public record PlayerStats(int Wins, int Games, float? Winrate, float? WinrateLastX);

    private record RawStats(int Id, string Name, int Games, int Wins, int WinsLastX);

    private static async Task<Results<Ok<Response>, BadRequest>> Handle(
        [FromQuery] int? windowSize,
        [FromQuery] int? podSize,
        [FromQuery] int[]? playerIds,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        windowSize ??= 10;
        if (podSize is not null && playerIds!.Length != 0)
        {
            return TypedResults.BadRequest();
        }

        var statsProvider = new PlayerStatsProvider(dbContext);
        var rawStats = (podSize, playerIds!.Length) switch
        {
            (null, 0) => await statsProvider.GetAll(windowSize.Value, ct),
            (not null, _) => await statsProvider.GetByPodSize(podSize.Value, windowSize.Value, ct),
            (_, not 0) => await statsProvider.GetByPlayerIds(playerIds, windowSize.Value, ct),
        };

        var dto = rawStats.Select(p =>
                new PlayerWithStatsDto(
                    p.Id,
                    p.Name,
                    new PlayerStats(
                        Wins: p.Wins,
                        Games: p.Games,
                        Winrate: p.Games > 0 ? (float)p.Wins / p.Games : null,
                        WinrateLastX: p.Games > 0 ? (float)p.WinsLastX / Math.Min(p.Games, windowSize.Value) : null)))
            .ToList();

        var response = new Response(dto);
        return TypedResults.Ok(response);
    }

    private class PlayerStatsProvider(StatsDbContext dbContext)
    {
        public async Task<RawStats[]> GetAll(int windowSize, CancellationToken ct)
        {
            return await dbContext.Players
                .AsNoTracking()
                .Select(player => new RawStats(
                    player.Id,
                    player.Name,
                    player.Participated.Count,
                    player.Participated.Count(p => p.Placement == 0),
                    player.Participated
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
                .ThenInclude(p => p.Player)
                .ToArrayAsync(ct);

            var players = games
                .SelectMany(g => g.Participants)
                .Select(p => p.Player)
                .ToHashSet();

            return players
                .Select(player => new RawStats(
                    player.Id,
                    player.Name,
                    player.Participated.Count,
                    player.Participated.Count(p => p.Placement == 0),
                    player.Participated
                        .OrderByDescending(p => p.Game.PlayedAt)
                        .Take(windowSize)
                        .Count(p => p.Placement == 0)))
                .ToArray();
        }

        public async Task<RawStats[]> GetByPlayerIds(
            IReadOnlyCollection<int> playerIds,
            int windowSize,
            CancellationToken ct)
        {
            var games = await dbContext.Games
                .Where(g => g.Participants.Count == playerIds.Count &&
                            g.Participants.All(p => playerIds.Contains(p.PlayerId)))
                .Include(g => g.Participants)
                .ThenInclude(p => p.Player)
                .ToArrayAsync(ct);

            var players = games
                .SelectMany(g => g.Participants)
                .Select(p => p.Player)
                .ToHashSet();

            return players
                .Select(player => new RawStats(
                    player.Id,
                    player.Name,
                    player.Participated.Count,
                    player.Participated.Count(p => p.Placement == 0),
                    player.Participated
                        .OrderByDescending(p => p.Game.PlayedAt)
                        .Take(windowSize)
                        .Count(p => p.Placement == 0)))
                .ToArray();
        }
    }
}