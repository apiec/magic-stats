using MagicStats.Persistence.EfCore.Entities;

namespace MagicStats.Api.Games;

public record GameDto(
    string Id,
    DateTimeOffset LastModified,
    DateTimeOffset PlayedAt,
    ParticipantDto Winner,
    int? Turns,
    string? Host, // todo: just return a host obj here man ;_;
    bool? Irl,
    IEnumerable<ParticipantDto> Participants);

public record ParticipantDto(CommanderDto Commander, PlayerDto Player, int StartingOrder, int Placement);

public record CommanderDto(string Id, string Name);

public record PlayerDto(string Id, string Name, bool IsGuest);

internal static class GameMapper
{
    public static GameDto MapGame(Game g)
    {
        var participants = g.Participants.Select(ToDto).ToArray();
        var winner = participants.MinBy(p => p.Placement);
        return new GameDto(
            g.Id.ToString(),
            g.LastModified,
            g.PlayedAt,
            winner!,
            g.TurnCount,
            g.Host?.Name,
            g.Host?.Irl,
            participants);
    }

    public static ParticipantDto ToDto(this Participant p) =>
        new(p.Commander.ToDto(), p.Player.ToDto(), p.StartingOrder, p.Placement);

    public static PlayerDto ToDto(this Player p) => new(p.Id.ToString(), p.Name, p.IsGuest);
    public static CommanderDto ToDto(this Commander c) => new(c.Id.ToString(), c.Name);
}