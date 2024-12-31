using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using MagicStats.Stats.Domain;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Players;

public class GetPlayersWinrates : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/winrates", Handle);

    public record Response(IReadOnlyCollection<PlayerWinratesOverTime> PlayerWinrates);

    private static async Task<Results<Ok<Response>, BadRequest>> Handle(
        [FromQuery] int? slidingWindowSize,
        [FromQuery] int? podSize,
        [FromQuery] int[]? playerIds,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        if (podSize is not null && playerIds!.Length != 0)
        {
            return TypedResults.BadRequest();
        }

        var dataProvider = new DataProvider(dbContext, ct);
        var (games, players) = (podSize, playerIds!.Length) switch
        {
            (null, 0) => await dataProvider.GetAllData(),
            (not null, _) => await dataProvider.GetByPodSize(podSize.Value),
            (_, not 0) => await dataProvider.GetByPlayers(playerIds),
        };

        slidingWindowSize ??= 10;

        var calculator = new PlayerWinratesCalculator(games, players);
        var playerResults = calculator.Calculate(slidingWindowSize.Value).ToArray();

        var response = new Response(playerResults);
        return TypedResults.Ok(response);
    }
}

internal class DataProvider(StatsDbContext dbContext, CancellationToken ct)
{
    public async Task<(Game[], Player[])> GetAllData()
    {
        var games = await dbContext.Games
            .Include(g => g.Participants)
            .ThenInclude(p => p.Player)
            .ToArrayAsync(ct);

        var players = await dbContext.Players
            .Include(p => p.Participated)
            .ThenInclude(p => p.Game)
            .ToArrayAsync(ct);
        return (games, players);
    }

    public async Task<(Game[], Player[])> GetByPodSize(int podSize)
    {
        var games = await dbContext.Games
            .Include(g => g.Participants)
            .ThenInclude(p => p.Player)
            .Where(g => g.Participants.Count == podSize)
            .ToArrayAsync(ct);

        var players = await dbContext.Players
            .Include(p => p.Participated)
            .ThenInclude(p => p.Game)
            .ToArrayAsync(ct);

        return (games, players);
    }

    public async Task<(Game[], Player[])> GetByPlayers(IReadOnlyCollection<int> playerIds)
    {
        var games = await dbContext.Games
            .Include(g => g.Participants)
            .ThenInclude(p => p.Player)
            .Where(g => g.Participants.Count == playerIds.Count &&
                        g.Participants.All(p => playerIds.Contains(p.PlayerId)))
            .ToArrayAsync(ct);

        var players = await dbContext.Players
            .Include(p => p.Participated)
            .ThenInclude(p => p.Game)
            .Where(p => playerIds.Contains(p.Id))
            .ToArrayAsync(ct);

        return (games, players);
    }
}