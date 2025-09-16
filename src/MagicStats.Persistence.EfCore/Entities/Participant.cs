using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MagicStats.Persistence.EfCore.Entities;

public class Participant
{
    public int Id { get; init; }

    public int GameId { get; init; }
    public Game Game { get; init; } = null!;

    public int PlayerId { get; init; }
    public Player Player { get; init; } = null!;

    public int CommanderId { get; init; }
    public Commander Commander { get; init; } = null!;

    public int StartingOrder { get; set; }
    public int Placement { get; set; }

    public bool IsWinner() => Placement == 0;
}

internal class ParticipantConfiguration : IEntityTypeConfiguration<Participant>
{
    public void Configure(EntityTypeBuilder<Participant> builder)
    {
        builder.HasKey(x => x.Id);

        builder
            .HasIndex(x => new { x.GameId, x.PlayerId })
            .IsUnique();

        builder
            .HasIndex(x => new { x.GameId, x.PlayerId, x.StartingOrder })
            .IsUnique();

        builder
            .HasIndex(x => new { x.GameId, x.PlayerId, x.Placement });

        builder
            .HasOne<Player>(x => x.Player)
            .WithMany(p => p.Participated)
            .HasForeignKey(x => x.PlayerId)
            .HasPrincipalKey(p => p.Id)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne<Commander>(x => x.Commander)
            .WithMany(c => c.Participated)
            .HasForeignKey(x => x.CommanderId)
            .HasPrincipalKey(c => c.Id)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .Property(x => x.StartingOrder)
            .IsRequired();
    }
}