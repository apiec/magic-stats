using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MagicStats.Persistence.EfCore.Entities;

public class Player
{
    public int Id { get; init; }

    [MaxLength(32)]
    public required string Name { get; set; }

    public bool IsGuest { get; set; }

    public List<Participant> Participated { get; init; } = null!;
}

internal class PlayerConfiguration : IEntityTypeConfiguration<Player>
{
    public void Configure(EntityTypeBuilder<Player> builder)
    {
        builder.HasKey(x => x.Id);
        builder
            .Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(50);
        builder
            .HasIndex(x => x.Name)
            .IsUnique();
    }
}