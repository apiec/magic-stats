using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Players.PlayerStats;

public class GetRecordAgainstPlayers : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/{playerId}/playerRecord", Handle);

    public record Response(PlayerRecord[] Records);

    public record PlayerRecord(
        string Id,
        string Name,
        bool IsGuest,
        int GamesAgainst,
        int WinsAgainst,
        int LossesAgainst,
        int AbsoluteDifference,
        float WinrateAgainst,
        float LossrateAgainst,
        float RelativeDifference);

    private class RecordAgainstPlayer
    {
        public int GamesAgainst { get; set; }
        public int WinsAgainst { get; set; }
        public int LossesAgainst { get; set; }
    }

    private static async Task<Results<Ok<Response>, NotFound>> Handle(
        [FromRoute] string playerId,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var intId = int.Parse(playerId);
        var player = await dbContext.Players
            .Where(p => p.Id == intId)
            .Include(p => p.Participated)
            .ThenInclude(g => g.Game)
            .ThenInclude(g => g.Participants)
            .ThenInclude(p => p.Player)
            .SingleOrDefaultAsync(ct);

        if (player is null)
        {
            return TypedResults.NotFound();
        }

        var games = player.Participated.Select(p => p.Game);
        var records = new Dictionary<int, RecordAgainstPlayer>();
        foreach (var game in games)
        {
            var playerIsWinner = game.Participants.Single(p => p.PlayerId == intId).IsWinner();
            foreach (var participant in game.Participants)
            {
                var participantId = participant.PlayerId;
                if (participantId == intId)
                {
                    continue;
                }

                if (!records.TryGetValue(participantId, out var record))
                {
                    record = new RecordAgainstPlayer();
                    records[participantId] = record;
                }

                record.GamesAgainst += 1;
                if (playerIsWinner)
                {
                    record.WinsAgainst += 1;
                }
                else if (participant.IsWinner())
                {
                    record.LossesAgainst += 1;
                }
            }
        }

        var players = await dbContext.Players
            .Where(p => records.Keys.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p, ct);

        var winrates = records
            .Select(kvp =>
            {
                var p = players[kvp.Key];
                var rec = kvp.Value;
                var winrate = (float)rec.WinsAgainst / rec.GamesAgainst;
                var lossrate = (float)rec.LossesAgainst / rec.GamesAgainst;
                return new PlayerRecord(
                    p.Id.ToString(),
                    p.Name,
                    p.IsGuest,
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