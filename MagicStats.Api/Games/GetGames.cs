using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Games;

public class GetGames : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/", Handle)
        .WithSummary("Get all games");

    public record Request();

    public record GameDto(
        int Id,
        DateTimeOffset LastModified,
        DateTimeOffset PlayedAt,
        IEnumerable<ParticipantDto> Participants);

    public record ParticipantDto(CommanderDto Commander, PlayerDto Player, int StartingOder, int Placement);

    public record CommanderDto(int Id, string Name);

    public record PlayerDto(int Id, string Name);

    public record Response(IEnumerable<GameDto> Games);

    private static async Task<Ok<Response>> Handle(
        StatsDbContext dbContext,
        TimeProvider timeProvider,
        CancellationToken ct)
    {
        var games = await dbContext.Games
            .Include(g => g.Participants)
            .ThenInclude(p => p.Player)
            .Include(g => g.Participants)
            .ThenInclude(p => p.Commander)
            .OrderByDescending(g => g.PlayedAt)
            .ToListAsync(ct);

        var response = new Response(games.Select(MapGame));

        return TypedResults.Ok(response);
    }

    private static GameDto MapGame(Game g) =>
        new GameDto(g.Id, g.LastModified, g.PlayedAt, g.Participants.Select(MapParticipant));

    private static ParticipantDto MapParticipant(Participant p) =>
        new(MapCommander(p.Commander), MapPlayer(p.Player), p.StartingOrder + 1, p.Placement + 1);

    private static PlayerDto MapPlayer(Player p) => new(p.Id, p.Name);
    private static CommanderDto MapCommander(Commander c) => new(c.Id, c.Name);
}