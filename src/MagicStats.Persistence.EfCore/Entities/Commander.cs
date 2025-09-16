using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MagicStats.Persistence.EfCore.Entities;

public class Commander
{
    public int Id { get; init; }

    [MaxLength(128)]
    public string CustomName { get; set; }

    public bool UseCustomDisplayName { get; set; }

    public int? CommanderCardId { get; set; }
    public CommanderCard? CommanderCard { get; set; }
    public int? PartnerCardId { get; set; }
    public CommanderCard? PartnerCard { get; set; }
    public List<Participant> Participated { get; init; }

    public string GetDisplayName() => UseCustomDisplayName || CommanderCard is null
        ? CustomName
        : GetCardsNames();

    public string GetCardsNames() =>
        CommanderCard?.Name + (PartnerCard is not null ? $"// {PartnerCard.Name}" : "");
}

internal class CommanderConfiguration : IEntityTypeConfiguration<Commander>
{
    public void Configure(EntityTypeBuilder<Commander> builder)
    {
        builder.HasKey(c => c.Id);
        builder
            .Property(c => c.CustomName)
            .IsRequired()
            .HasMaxLength(128);
        builder
            .HasIndex(c => c.CustomName)
            .IsUnique();

        builder
            .Property(c => c.UseCustomDisplayName)
            .HasDefaultValue(true);

        builder
            .HasOne<CommanderCard>(c => c.CommanderCard)
            .WithMany(c => c.AssignedCommanders)
            .HasForeignKey(c => c.CommanderCardId);
        builder
            .HasOne<CommanderCard>(c => c.PartnerCard)
            .WithMany(c => c.AssignedPartners)
            .HasForeignKey(c => c.PartnerCardId);
    }
}