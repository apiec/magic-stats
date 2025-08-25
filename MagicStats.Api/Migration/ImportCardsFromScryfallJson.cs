using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using ScryfallCard = MagicStats.Scryfall.Models.Card;

namespace MagicStats.Api.Migration;

public class ImportCardsFromScryfallJson : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPost("/scryfall/json", Handle)
        .WithSummary("Import card data from scryfall's json");

    private const int BatchSize = 1000;

    public record Result(int Processed, int FailedToDeserialize, int Commanders, int NonCommanders);

    [RequestSizeLimit(200_000_000)]
    private static async Task<Ok<Result>> Handle(
        IFormFile file,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        // todo: this file can be downloaded from scryfall directly from here
        var stream = file.OpenReadStream();
        var cards = JsonSerializer.DeserializeAsyncEnumerable<ScryfallCard>(stream, JsonSerializerOptions.Default, ct);
        var batch = new List<CommanderCard>(BatchSize);
        var failedToDeserialize = 0;
        var processed = 0;
        var commanders = 0;
        await foreach (var card in cards)
        {
            processed += 1;
            if (card is null)
            {
                failedToDeserialize += 1;
                continue;
            }

            if (!IsACommanderCard(card))
            {
                continue;
            }

            commanders += 1;
            try
            {
                var own = MapToOwn(card);
                batch.Add(own);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }

            if (batch.Count == BatchSize)
            {
                await dbContext.CommanderCards.AddRangeAsync(batch, ct);
                await dbContext.SaveChangesAsync(ct);
                batch.Clear();
            }
        }

        await dbContext.CommanderCards.AddRangeAsync(batch, ct);
        await dbContext.SaveChangesAsync(ct);

        return TypedResults.Ok(
            new Result(
                Processed: processed,
                FailedToDeserialize: failedToDeserialize,
                Commanders: commanders,
                NonCommanders: processed - failedToDeserialize - commanders));
    }

    private static bool IsACommanderCard(ScryfallCard card)
    {
        return card.TypeLine.Contains("legendary", StringComparison.OrdinalIgnoreCase)
               && (card.TypeLine.Contains("creature", StringComparison.OrdinalIgnoreCase)
                   || card.TypeLine.Contains("vehicle", StringComparison.OrdinalIgnoreCase)
                   || card.TypeLine.Contains("spacecraft", StringComparison.OrdinalIgnoreCase));
    }

    private static CommanderCard MapToOwn(ScryfallCard card)
    {
        var firstFace = card.ImageUris
                        ?? card.CardFaces?[0].ImageUris
                        ?? throw new ArgumentException(
                            $"card doesn't have image uris either in the og body or in the first face: {card.ScryfallUri}, {card.Id}, {card.Name}");
        var otherFace = card.CardFaces?[1].ImageUris;

        return new CommanderCard
        {
            ScryfallId = card.Id,
            Name = card.Name,
            ImageUris = MapImageUris(firstFace),
            OtherFaceUris = MapImageUris(otherFace),
        };
    }

    [return: NotNullIfNotNull(nameof(imageUris))]
    private static ImageUris? MapImageUris(Scryfall.Models.ImageUris? imageUris)
    {
        if (imageUris is null)
        {
            return null;
        }

        return new ImageUris
        {
            Png = imageUris.Png,
            BorderCrop = imageUris.BorderCrop,
            ArtCrop = imageUris.ArtCrop,
            Large = imageUris.Large,
            Normal = imageUris.Normal,
            Small = imageUris.Small,
        };
    }
}