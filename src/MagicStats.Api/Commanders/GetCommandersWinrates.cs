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

namespace MagicStats.Api.Commanders;

public class GetCommandersWinrates : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/winrates", Handle);

    public record Response(IReadOnlyCollection<CommanderWinratesOverTime> CommanderWinrates);

    private static async Task<Ok<Response>> Handle(
        [FromQuery] int? slidingWindowSize,
        [FromQuery] int? podSize,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var dataProvider = new CommanderWinratesDataProvider(dbContext, ct);
        var (games, commanders) = podSize is null
            ? await dataProvider.GetAllData()
            : await dataProvider.GetByPodSize(podSize.Value);

        var calculator = new CommanderWinratesCalculator(games, commanders);
        var commanderResults = calculator.Calculate(slidingWindowSize).ToArray();

        var response = new Response(commanderResults);
        return TypedResults.Ok(response);
    }

    private class CommanderWinratesDataProvider(StatsDbContext dbContext, CancellationToken ct)
    {
        public async Task<(Game[], Commander[])> GetAllData()
        {
            var games = await dbContext.Games
                .Include(g => g.Participants)
                .ThenInclude(p => p.Commander)
                .ToArrayAsync(ct);

            var commanders = games
                .SelectMany(p => p.Participants)
                .Select(p => p.Commander)
                .ToHashSet()
                .ToArray();

            return (games, commanders);
        }

        public async Task<(Game[], Commander[])> GetByPodSize(int podSize)
        {
            var games = await dbContext.Games
                .Include(g => g.Participants)
                .ThenInclude(p => p.Commander)
                .Where(g => g.Participants.Count == podSize)
                .ToArrayAsync(ct);

            var commanders = games
                .SelectMany(p => p.Participants)
                .Select(p => p.Commander)
                .ToHashSet()
                .ToArray();

            return (games, commanders);
        }
    }
}