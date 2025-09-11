using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MagicStats.Persistence.EfCore.Entities;

public class Commander
{
    public int Id { get; init; }

    [MaxLength(128)]
    public required string Name { get; set; }

    public int? CommanderCardId { get; set; }
    public CommanderCard? CommanderCard { get; set; }
    public int? PartnerCardId { get; set; }
    public CommanderCard? PartnerCard { get; set; }
    public List<Participant> Participated { get; init; }
}

internal class CommanderConfiguration : IEntityTypeConfiguration<Commander>
{
    public void Configure(EntityTypeBuilder<Commander> builder)
    {
        builder.HasKey(c => c.Id);
        builder
            .Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(128);
        builder
            .HasIndex(c => c.Name)
            .IsUnique();

        builder
            .HasOne<CommanderCard>(c => c.CommanderCard)
            .WithMany()
            .HasForeignKey(c => c.CommanderCardId);
        builder
            .HasOne<CommanderCard>(c => c.PartnerCard)
            .WithMany()
            .HasForeignKey(c => c.PartnerCardId);
    }
}