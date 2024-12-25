using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
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

    public record CommanderWinratesOverTime(
        int Id,
        string Name,
        List<DataPoint> DataPoints);

    public record DataPoint(
        DateOnly Date,
        float? Winrate);

    private static async Task<Ok<Response>> Handle(
        [FromQuery] int? slidingWindowSize,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var games = await dbContext.Games
            .Include(g => g.Participants)
            .ThenInclude(p => p.Commander)
            .ToListAsync(ct);

        var window = slidingWindowSize ?? games.Count;
        var commanders = await dbContext.Commanders
            .Include(p => p.Participated)
            .ThenInclude(p => p.Game)
            .ToListAsync(ct);

        var meetings = games.GroupBy(g => g.PlayedAt.Date).OrderBy(g => g.Key).ToArray();
        var commanderResults = commanders.ToDictionary(
            c => c.Id,
            c => new CommanderWinratesOverTime(c.Id, c.Name, new List<DataPoint>(meetings.Length)));
        var commanderRecords = commanders.ToDictionary(p => p.Id, _ => new Queue<bool>(window));

        foreach (var meeting in meetings)
        {
            foreach (var game in meeting)
            {
                foreach (var participant in game.Participants)
                {
                    var record = commanderRecords[participant.CommanderId];
                    record.Enqueue(participant.IsWinner());
                    while (record.Count > window)
                    {
                        record.Dequeue();
                    }
                }
            }

            var meetingDate = DateOnly.FromDateTime(meeting.Key.Date);
            foreach (var (playerId, record) in commanderRecords)
            {
                var winCount = record.Count(isWin => isWin);
                if (record.Count > 0)
                {
                    commanderResults[playerId]
                        .DataPoints.Add(new DataPoint(meetingDate, (float)winCount / record.Count));
                }
            }
        }

        var response = new Response(commanderResults.Values.Where(x => x.DataPoints.Count > 0).ToArray());
        return TypedResults.Ok(response);
    }
}