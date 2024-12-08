using MagicStats.Persistence.EfCore.Entities;

namespace MagicStats.Api.Games;

public record GameDto(
    string Id,
    DateTimeOffset LastModified,
    DateTimeOffset PlayedAt,
    IEnumerable<ParticipantDto> Participants);

public record ParticipantDto(CommanderDto Commander, PlayerDto Player, int StartingOder, int Placement);

public record CommanderDto(string Id, string Name);

public record PlayerDto(string Id, string Name);

internal static class GameMapper
{
    public static GameDto MapGame(Game g) =>
        new GameDto(g.Id.ToString(), g.LastModified, g.PlayedAt, g.Participants.Select(MapParticipant));

    public static ParticipantDto MapParticipant(Participant p) =>
        new(MapCommander(p.Commander), MapPlayer(p.Player), p.StartingOrder + 1, p.Placement + 1);

    private static PlayerDto MapPlayer(Player p) => new(p.Id.ToString(), p.Name);
    private static CommanderDto MapCommander(Commander c) => new(c.Id.ToString(), c.Name);
}