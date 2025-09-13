using MagicStats.Api.Games;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Commanders.CommanderStats;

public class GetCommander : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/{commanderId}", Handle);

    public record CommanderWithStatsDto(
        string Id,
        string Name,
        CardDto? Card,
        CardDto? Partner,
        CommanderStats Stats);

    public record CommanderStats(int Wins, int Games, float? Winrate);

    private static async Task<Results<Ok<CommanderWithStatsDto>, NotFound>> Handle(
        [FromRoute] string commanderId,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var intId = int.Parse(commanderId);
        var commander = await dbContext.Commanders
            .AsNoTracking()
            .Where(c => c.Id == intId)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.CommanderCard,
                c.PartnerCard,
                Games = c.Participated.Count,
                Wins = c.Participated.Count(p => p.Placement == 0),
            })
            .SingleOrDefaultAsync(ct);

        if (commander is null)
        {
            return TypedResults.NotFound();
        }

        var stats = new CommanderStats(
            Wins: commander.Wins,
            Games: commander.Games,
            Winrate: commander.Games > 0 ? (float)commander.Wins / commander.Games : null);

        var response = new CommanderWithStatsDto(
            commander.Id.ToString(),
            commander.Name,
            commander.CommanderCard?.ToDto(),
            commander.PartnerCard?.ToDto(),
            stats);
        return TypedResults.Ok(response);
    }
}