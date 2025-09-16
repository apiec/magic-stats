using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MagicStats.Persistence.EfCore.Entities;

public class Host
{
    public int Id { get; set; }

    [MaxLength(32)]
    public required string Name { get; set; }

    public required bool Irl { get; set; }

    public ICollection<Game> Games { get; init; } = new List<Game>();
}

internal class HostConfiguration : IEntityTypeConfiguration<Host>
{
    public void Configure(EntityTypeBuilder<Host> builder)
    {
        builder.HasIndex(h => h.Name);
        builder.HasIndex(h => h.Irl);
    }
}