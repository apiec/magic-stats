using MagicStats.Persistence.EfCore.Entities;

namespace MagicStats.Stats.Domain;

public record CommanderWinratesOverTime(
    int Id,
    string Name,
    List<DataPoint> DataPoints);

public class CommanderWinratesCalculator(IReadOnlyCollection<Game> games, IReadOnlyCollection<Commander> commanders)
{
    public IEnumerable<CommanderWinratesOverTime> Calculate(int slidingWindowSize)
    {
        var meetings = games.GroupBy(g => g.PlayedAt.Date).OrderBy(g => g.Key).ToArray();

        var commanderResults = commanders.ToDictionary(
            p => p.Id,
            p => new CommanderWinratesOverTime(p.Id, p.Name, new List<DataPoint>(meetings.Length)));

        var commanderRecords = commanders.ToDictionary(p => p.Id, _ => new Queue<bool>(slidingWindowSize));
        foreach (var meeting in meetings)
        {
            foreach (var game in meeting)
            {
                foreach (var participant in game.Participants)
                {
                    var record = commanderRecords[participant.CommanderId];
                    record.Enqueue(participant.IsWinner());
                    while (record.Count > slidingWindowSize)
                    {
                        record.Dequeue();
                    }
                }
            }

            var meetingDate = DateOnly.FromDateTime(meeting.Key.Date);
            foreach (var (commanderId, record) in commanderRecords)
            {
                if (record.Count == 0)
                    continue;

                var winCount = record.Count(isWin => isWin);
                commanderResults[commanderId].DataPoints.Add(new DataPoint(meetingDate, (float)winCount / record.Count));
            }
        }

        return commanderResults.Values;
    }
}