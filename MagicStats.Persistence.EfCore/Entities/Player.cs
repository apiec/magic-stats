using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MagicStats.Persistence.EfCore.Entities;

public class Player
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public List<Participant> Participated { get; init; }
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