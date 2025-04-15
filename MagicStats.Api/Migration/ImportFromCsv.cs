using System.Globalization;
using System.Runtime.InteropServices.JavaScript;
using CsvHelper;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Migration;

public class ImportFromCsv : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPost("/csv", Handle)
        .WithSummary("Import data from csv");

    private static async Task<Ok> Handle(
        IFormFile file,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var stream = file.OpenReadStream();
        var streamReader = new StreamReader(stream);
        var csvParser = new CsvParser(streamReader, CultureInfo.InvariantCulture);

        var csvReader = new CsvReader(csvParser);
        var records = new List<GameRecord>();
        await foreach (var record in csvReader.GetRecordsAsync<GameRecord>(ct))
        {
            records.Add(record);
        }

        var filePlayers = records
            .Select(r => r.Player)
            .ToHashSet();
        var existingPlayers = await dbContext.Players.ToListAsync(ct);
        var playersToAdd = filePlayers.Except(existingPlayers.Select(p => p.Name), StringComparer.OrdinalIgnoreCase);
        dbContext.Players.AddRange(playersToAdd.Select(name => new Player { Name = name }));

        var fileCommanders = records
            .Select(r => r.Commander)
            .ToHashSet();
        var existingCommanders = await dbContext.Commanders.ToListAsync(ct);
        var commandersToAdd =
            fileCommanders.Except(existingCommanders.Select(p => p.Name), StringComparer.OrdinalIgnoreCase);
        dbContext.Commanders.AddRange(commandersToAdd.Select(name => new Commander { Name = name }));

        var fileHosts = records
            .Select(r => r.Host)
            .ToHashSet();
        var existingHosts = await dbContext.Hosts.ToListAsync(ct);
        var hostsToAdd = fileHosts.Except(existingHosts.Select(p => p.Name), StringComparer.OrdinalIgnoreCase);
        dbContext.Hosts.AddRange(hostsToAdd.Select(name => new Host
        {
            Name = name,
            Irl = !string.Equals(name, "TTS", StringComparison.OrdinalIgnoreCase),
        }));
        await dbContext.SaveChangesAsync(ct);

        var players =
            await dbContext.Players.ToDictionaryAsync(p => p.Name, p => p, StringComparer.OrdinalIgnoreCase, ct);
        var commanders =
            await dbContext.Commanders.ToDictionaryAsync(c => c.Name, c => c, StringComparer.OrdinalIgnoreCase, ct);
        var hosts = await dbContext.Hosts.ToDictionaryAsync(h => h.Name, h => h, StringComparer.OrdinalIgnoreCase, ct);

        var now = DateTimeOffset.UtcNow;
        var firstRecord = records.First();
        var game = new Game
        {
            LastModified = now,
            PlayedAt = firstRecord.Date.AddHours(17 + firstRecord.Game),
            TurnCount = null,
            Host = hosts[firstRecord.Host],
            Participants = [],
        };
        var currentGameId = firstRecord.GameId;
        foreach (var record in records.Skip(1))
        {
            if (record.GameId != currentGameId)
            {
                dbContext.Games.Add(game);
                game = new Game
                {
                    LastModified = now,
                    PlayedAt = record.Date.AddHours(17 + record.Game),
                    TurnCount = null,
                    Host = hosts[record.Host],
                    Participants = [],
                };
                currentGameId = record.GameId;
            }

            var participant = new Participant
            {
                Game = game,
                Player = players[record.Player],
                Commander = commanders[record.Commander],
                StartingOrder = record.Order - 1,
                Placement = record.Pod - record.Points,
            };
            game.Participants.Add(participant);
        }

        dbContext.Add(game);

        await dbContext.SaveChangesAsync(ct);
        return TypedResults.Ok();
    }
}

internal record GameRecord(
    DateTimeOffset Date,
    int Game,
    string Player,
    string Commander,
    int Points,
    int Pod,
    int Order,
    string Host,
    string GameId);