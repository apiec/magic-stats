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

public record CommanderDto(string Id, string Name, CardDto? Card, CardDto? Partner);

public record CardDto(
    string Id,
    string Name,
    Guid ScryfallId,
    Uri ScyrfallUri,
    ImageUris Images,
    ImageUris? OtherFaceImages);

public record ImageUris(
    Uri Png,
    Uri BorderCrop,
    Uri ArtCrop,
    Uri Large,
    Uri Normal,
    Uri Small);

public record PlayerDto(string Id, string Name, bool IsGuest);

internal static class GameMapper
{
    public static GameDto ToDto(this Game g)
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

    public static CommanderDto ToDto(this Commander c) => new(
        c.Id.ToString(),
        c.Name,
        c.CommanderCard?.ToDto(),
        c.PartnerCard?.ToDto());

    public static CardDto ToDto(this CommanderCard c) => new(c.Id.ToString(),
        c.Name,
        c.ScryfallId,
        c.ScryfallUri,
        c.ImageUris.ToDto(),
        c.OtherFaceUris?.ToDto());

    public static ImageUris ToDto(this MagicStats.Persistence.EfCore.Entities.ImageUris images) => new(
        images.Png,
        images.BorderCrop,
        images.ArtCrop,
        images.Large,
        images.Normal,
        images.Small);
}