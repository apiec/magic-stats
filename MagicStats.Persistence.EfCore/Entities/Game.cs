using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MagicStats.Persistence.EfCore.Entities;

public class Game
{
    public int Id { get; init; }
    public DateTimeOffset LastModified { get; set; }
    public DateTimeOffset PlayedAt { get; set; }
    public ICollection<Participant> Participants { get; init; } = new List<Participant>();

    public Participant AddParticipant(int playerId, int commanderId, int? startingOrder, int? placement)
    {
        var participant = new Participant
        {
            PlayerId = playerId,
            CommanderId = commanderId,
            StartingOrder = startingOrder ?? Participants.Count,
            Placement = placement ?? Participants.Count,
        };

        foreach (var participantToMove in Participants.Where(p => p.Placement >= participant.Placement))
        {
            participantToMove.Placement += 1;
        }

        foreach (var participantToMove in Participants.Where(p => p.StartingOrder >= participant.Placement))
        {
            participantToMove.StartingOrder += 1;
        }

        Participants.Add(participant);

        return participant;
    }
}

internal class GameConfiguration : IEntityTypeConfiguration<Game>
{
    public void Configure(EntityTypeBuilder<Game> builder)
    {
        builder.HasKey(g => g.Id);

        builder
            .Property(g => g.LastModified)
            .IsRequired();

        builder
            .Property(g => g.PlayedAt)
            .IsRequired();
        builder.HasIndex(g => g.PlayedAt);

        builder
            .HasMany<Participant>(g => g.Participants)
            .WithOne(p => p.Game)
            .HasForeignKey(p => p.GameId)
            .HasPrincipalKey(g => g.Id)
            .OnDelete(DeleteBehavior.Cascade);
    }
}