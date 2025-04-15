using MagicStats.Persistence.EfCore.Entities;

namespace MagicStats.Stats.Domain;

public record PlayerWinratesOverTime(
    int Id,
    string Name,
    List<DataPoint> DataPoints);

public class PlayerWinratesCalculator(IReadOnlyCollection<Game> games, IReadOnlyCollection<Player> players)
{
    public IEnumerable<PlayerWinratesOverTime> Calculate(int? slidingWindowSize)
    {
        var meetings = games.GroupBy(g => g.PlayedAt.Date).OrderBy(g => g.Key).ToArray();

        var playerResults = players.ToDictionary(
            p => p.Id,
            p => new PlayerWinratesOverTime(p.Id, p.Name, new List<DataPoint>(meetings.Length)));

        var playerRecords = players.ToDictionary(p => p.Id, _ => new Queue<bool>());
        foreach (var meeting in meetings)
        {
            foreach (var game in meeting)
            {
                foreach (var participant in game.Participants)
                {
                    var record = playerRecords[participant.PlayerId];
                    record.Enqueue(participant.IsWinner());
                    while (slidingWindowSize is not null && record.Count > slidingWindowSize)
                    {
                        record.Dequeue();
                    }
                }
            }

            var meetingDate = DateOnly.FromDateTime(meeting.Key.Date);
            foreach (var (playerId, record) in playerRecords)
            {
                if (record.Count == 0)
                    continue;

                var winCount = record.Count(isWin => isWin);
                playerResults[playerId].DataPoints.Add(new DataPoint(meetingDate, (float)winCount / record.Count));
            }
        }

        return playerResults.Values;
    }
}