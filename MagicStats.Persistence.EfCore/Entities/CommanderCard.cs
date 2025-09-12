using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MagicStats.Persistence.EfCore.Entities;

public class CommanderCard
{
    public int Id { get; init; }
    public Guid ScryfallId { get; init; }

    [MaxLength(128)]
    public required string Name { get; init; }

    public required Uri ScryfallUri { get; init; }
    public required ImageUris ImageUris { get; init; }
    public ImageUris? OtherFaceUris { get; init; }
}

public class ImageUris
{
    public required Uri Png { get; init; }
    public required Uri BorderCrop { get; init; }
    public required Uri ArtCrop { get; init; }
    public required Uri Large { get; init; }
    public required Uri Normal { get; init; }
    public required Uri Small { get; init; }
}

internal class CommanderCardConfiguration : IEntityTypeConfiguration<CommanderCard>
{
    public void Configure(EntityTypeBuilder<CommanderCard> builder)
    {
        builder.HasKey(c => c.Id);

        // to make ef core update the rows when doing a data import from scryfall
        builder.HasAlternateKey(c => c.ScryfallId);

        builder.HasIndex(c => c.Name);

        builder.OwnsOne(c => c.ImageUris,
            uris =>
            {
                uris.Property(u => u.Png).HasColumnName("PngUri");
                uris.Property(u => u.BorderCrop).HasColumnName("BorderCropUri");
                uris.Property(u => u.ArtCrop).HasColumnName("ArtCropUri");
                uris.Property(u => u.Large).HasColumnName("LargeUri");
                uris.Property(u => u.Normal).HasColumnName("NormalUri");
                uris.Property(u => u.Small).HasColumnName("SmallUri");
            });
        builder.OwnsOne(c => c.OtherFaceUris,
            uris =>
            {
                uris.Property(u => u.Png).HasColumnName("OtherFacePngUri");
                uris.Property(u => u.BorderCrop).HasColumnName("OtherFaceBorderCropUri");
                uris.Property(u => u.ArtCrop).HasColumnName("OtherFaceArtCropUri");
                uris.Property(u => u.Large).HasColumnName("OtherFaceLargeUri");
                uris.Property(u => u.Normal).HasColumnName("OtherFaceNormalUri");
                uris.Property(u => u.Small).HasColumnName("OtherFaceSmallUri");
            });
    }
}