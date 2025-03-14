﻿using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MagicStats.Persistence.EfCore.Entities;

public class Commander
{
    public int Id { get; init; }
    [MaxLength(128)]
    public required string Name { get; init; }

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
            .HasMaxLength(50);
        builder
            .HasIndex(c => c.Name)
            .IsUnique();
    }
}