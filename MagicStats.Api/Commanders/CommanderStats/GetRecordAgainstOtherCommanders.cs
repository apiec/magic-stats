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

public class GetRecordAgainstOtherCommanders : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/{commanderId}/commanderRecord", Handle);

    public record Response(CommanderRecord[] Records);

    public record CommanderRecord(
        CommanderDto Commander,
        int GamesAgainst,
        int WinsAgainst,
        int LossesAgainst,
        int AbsoluteDifference,
        float WinrateAgainst,
        float LossrateAgainst,
        float RelativeDifference);

    private class RecordAgainstCommander
    {
        public int GamesAgainst { get; set; }
        public int WinsAgainst { get; set; }
        public int LossesAgainst { get; set; }
    }

    private static async Task<Results<Ok<Response>, NotFound>> Handle(
        [FromRoute] string commanderId,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var intId = int.Parse(commanderId);
        var commander = await dbContext.Commanders
            .Where(p => p.Id == intId)
            .Include(p => p.Participated)
            .ThenInclude(g => g.Game)
            .ThenInclude(g => g.Participants)
            .ThenInclude(p => p.Commander)
            .SingleOrDefaultAsync(ct);

        if (commander is null)
        {
            return TypedResults.NotFound();
        }

        var games = commander.Participated.Select(p => p.Game);
        var records = new Dictionary<int, RecordAgainstCommander>();
        foreach (var game in games)
        {
            var commanderIsWinner = game.Participants.Single(p => p.CommanderId == intId).IsWinner();
            foreach (var participant in game.Participants)
            {
                var participantId = participant.CommanderId;
                if (participantId == intId)
                {
                    continue;
                }

                if (!records.TryGetValue(participantId, out var record))
                {
                    record = new RecordAgainstCommander();
                    records[participantId] = record;
                }

                record.GamesAgainst += 1;
                if (commanderIsWinner)
                {
                    record.WinsAgainst += 1;
                }
                else if (participant.IsWinner())
                {
                    record.LossesAgainst += 1;
                }
            }
        }

        var commanders = await dbContext.Commanders
            .Include(c => c.CommanderCard)
            .Include(c => c.PartnerCard)
            .Where(p => records.Keys.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p, ct);

        var winrates = records
            .Select(kvp =>
            {
                var p = commanders[kvp.Key];
                var rec = kvp.Value;
                var winrate = (float)rec.WinsAgainst / rec.GamesAgainst;
                var lossrate = (float)rec.LossesAgainst / rec.GamesAgainst;
                return new CommanderRecord(
                    p.ToDto(),
                    rec.GamesAgainst,
                    rec.WinsAgainst,
                    rec.LossesAgainst,
                    rec.WinsAgainst - rec.LossesAgainst,
                    winrate,
                    lossrate,
                    winrate - lossrate);
            })
            .ToArray();

        return TypedResults.Ok(new Response(winrates));
    }
}