using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
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

    private static async Task<Ok<Response>> Handle(StatsDbContext dbContext, CancellationToken ct)
    {
        var games = await dbContext.Games
            .Include(g => g.Participants)
            .ThenInclude(p => p.Player)
            .ToListAsync(ct);

        var players = await dbContext.Players
            .Include(p => p.Participated)
            .ThenInclude(p => p.Game)
            .ToListAsync(ct);

        var meetings = games.GroupBy(g => g.PlayedAt.Date).OrderBy(g => g.Key).ToArray();
        var playerResults = players.ToDictionary(
            p => p.Id,
            p => new PlayerWinratesOverTime(p.Id, p.Name, new List<DataPoint>(meetings.Length)));
        var playerWins = players.ToDictionary(p => p.Id, _ => 0);
        var gamesCount = 0;

        foreach (var meeting in meetings)
        {
            gamesCount += meeting.Count();
            foreach (var game in meeting)
            {
                var winnerId = game.Participants.First(p => p.Placement == 0).PlayerId;
                playerWins[winnerId] += 1;
            }

            var date = DateOnly.FromDateTime(meeting.Key.Date);
            foreach (var (playerId, winCount) in playerWins)
            {
                playerResults[playerId].DataPoints.Add(new DataPoint(date, (float)winCount / gamesCount));
            }
        }

        var response = new Response(playerResults.Values);
        return TypedResults.Ok(response);
    }
}