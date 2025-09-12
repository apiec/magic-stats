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

    public record Result(
        int Processed,
        int FailedToDeserialize,
        int Commanders,
        int NonCommanders,
        int Updated,
        int New,
        int Deleted,
        int CouldNotDelete);

    [RequestSizeLimit(200_000_000)]
    private static async Task<Ok<Result>> Handle(
        IFormFile file,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var stream = file.OpenReadStream();
        var cards = JsonSerializer.DeserializeAsyncEnumerable<ScryfallCard>(stream, JsonSerializerOptions.Default, ct);
        var batch = new List<CommanderCard>(BatchSize);
        var failedToDeserialize = 0;
        var processed = 0;
        var commanders = 0;
        var updatedCards = 0;
        var newCards = 0;
        var updateId = Guid.NewGuid();

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
                own.UpdateId = updateId;
                own.LastUpdateTimestamp = DateTimeOffset.UtcNow;
                batch.Add(own);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }

            if (batch.Count == BatchSize)
            {
                var (up, nw) = await ProcessBatch(batch, updateId, dbContext, ct);
                updatedCards += up;
                newCards += nw;
                batch.Clear();
            }
        }

        var (upp, nww) = await ProcessBatch(batch, updateId, dbContext, ct);
        updatedCards += upp;
        newCards += nww;

        // delete cards that weren't present in the json file and are not assigned to any commanders
        var deleted = await dbContext.CommanderCards
            .Where(c => c.UpdateId != updateId
                        && c.AssignedCommanders.Count == 0
                        && c.AssignedPartners.Count == 0)
            .ExecuteDeleteAsync(ct);
        var couldNotDelete = await dbContext.CommanderCards
            .Where(c => c.UpdateId != updateId)
            .CountAsync(ct);

        return TypedResults.Ok(
            new Result(
                Processed: processed,
                FailedToDeserialize: failedToDeserialize,
                Commanders: commanders,
                NonCommanders: processed - failedToDeserialize - commanders,
                Updated: updatedCards,
                New: newCards,
                Deleted: deleted,
                CouldNotDelete: couldNotDelete));
    }

    private static async Task<(int Updated, int New)> ProcessBatch(List<CommanderCard> batch,
        Guid updateId,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var existingCards = await dbContext.CommanderCards
            .Where(existing =>
                batch.Select(newCard => newCard.ScryfallId).Contains(existing.ScryfallId))
            .ToDictionaryAsync(c => c.ScryfallId, c => c, ct);
        var updatedCards = 0;
        var newCards = 0;
        foreach (var batchCard in batch)
        {
            if (existingCards.TryGetValue(batchCard.ScryfallId, out var existingCard))
            {
                existingCard.UpdateFromOther(batchCard, updateId, DateTimeOffset.UtcNow);
                dbContext.CommanderCards.Update(existingCard);
                updatedCards += 1;
            }
            else
            {
                await dbContext.CommanderCards.AddAsync(batchCard, ct);
                newCards += 1;
            }
        }

        await dbContext.SaveChangesAsync(ct);

        return (updatedCards, newCards);
    }

    // todo: check for other cards that can be commanders (like planeswalkers) D:
    private static bool IsACommanderCard(ScryfallCard card)
    {
        return card.Games.Contains("paper", StringComparer.OrdinalIgnoreCase)
               && card.Legalities.TryGetValue("commander", out var legality)
               && legality.Equals("legal", StringComparison.OrdinalIgnoreCase)
               && card.TypeLine.Contains("legendary", StringComparison.OrdinalIgnoreCase)
               && (card.TypeLine.Contains("creature", StringComparison.OrdinalIgnoreCase)
                   || card.TypeLine.Contains("vehicle", StringComparison.OrdinalIgnoreCase)
                   || card.TypeLine.Contains("spacecraft", StringComparison.OrdinalIgnoreCase)
                   || card.TypeLine.Contains("background", StringComparison.OrdinalIgnoreCase)
                   || card.OracleText?.Contains("can be your commander", StringComparison.OrdinalIgnoreCase) is true);
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
            ScryfallUri = card.ScryfallUri,
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