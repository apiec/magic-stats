using MagicStats.Persistence.EfCore.Entities;

namespace MagicStats.Api.Games;

public record GameDto(
    string Id,
    DateTimeOffset LastModified,
    DateTimeOffset PlayedAt,
    ParticipantDto Winner,
    IEnumerable<ParticipantDto> Participants);

public record ParticipantDto(CommanderDto Commander, PlayerDto Player, int StartingOrder, int Placement);

public record CommanderDto(string Id, string Name);

public record PlayerDto(string Id, string Name);

internal static class GameMapper
{
    public static GameDto MapGame(Game g)
    {
        var participants = g.Participants.Select(MapParticipant).ToArray();
        var winner = participants.MinBy(p => p.Placement);
        return new GameDto(g.Id.ToString(), g.LastModified, g.PlayedAt, winner!, participants);
    }

    public static ParticipantDto MapParticipant(Participant p) =>
        new(MapCommander(p.Commander), MapPlayer(p.Player), p.StartingOrder, p.Placement);

    private static PlayerDto MapPlayer(Player p) => new(p.Id.ToString(), p.Name);
    private static CommanderDto MapCommander(Commander c) => new(c.Id.ToString(), c.Name);
}