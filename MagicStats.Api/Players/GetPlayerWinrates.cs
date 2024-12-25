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

public class GetPlayerWinrates : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/winrates", Handle);

    public record Response(IReadOnlyCollection<PlayerWinratesOverTime> PlayerWinrates);

    public record PlayerWinratesOverTime(
        int Id,
        string Name,
        List<DataPoint> DataPoints);

    public record DataPoint(
        DateOnly Date,
        float Winrate);

    private static async Task<Ok<Response>> Handle(
        [FromQuery] int? slidingWindowSize,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var games = await dbContext.Games
            .Include(g => g.Participants)
            .ThenInclude(p => p.Player)
            .ToListAsync(ct);

        var window = slidingWindowSize ?? games.Count;
        var players = await dbContext.Players
            .Include(p => p.Participated)
            .ThenInclude(p => p.Game)
            .ToListAsync(ct);

        var meetings = games.GroupBy(g => g.PlayedAt.Date).OrderBy(g => g.Key).ToArray();
        var playerResults = players.ToDictionary(
            p => p.Id,
            p => new PlayerWinratesOverTime(p.Id, p.Name, new List<DataPoint>(meetings.Length)));
        var playerRecords = players.ToDictionary(p => p.Id, _ => new Queue<bool>(window));

        foreach (var meeting in meetings)
        {
            foreach (var game in meeting)
            {
                foreach (var participant in game.Participants)
                {
                    var record = playerRecords[participant.PlayerId];
                    record.Enqueue(participant.IsWinner());
                    while (record.Count > window)
                    {
                        record.Dequeue();
                    }
                }
            }

            var meetingDate = DateOnly.FromDateTime(meeting.Key.Date);
            foreach (var (playerId, record) in playerRecords)
            {
                var winCount = record.Count(isWin => isWin);
                playerResults[playerId].DataPoints.Add(new DataPoint(meetingDate, (float)winCount / record.Count));
            }
        }

        var response = new Response(playerResults.Values);
        return TypedResults.Ok(response);
    }
}