using MagicStats.Api.Games;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Commanders;

public class CreateCommander : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPost("/", Handle)
        .WithSummary("Create a commander");

    public record Request(bool UseCustomDisplayName, string? CustomName, string? CardId, string? PartnerId);

    private static async Task<Results<
            Ok<CommanderDto>,
            BadRequest<string>,
            NotFound<string>>>
        Handle(
            [FromBody] Request request,
            StatsDbContext dbContext,
            CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.CustomName) && string.IsNullOrWhiteSpace(request.CardId))
        {
            return TypedResults.BadRequest("Need to provide at least either Name or CardId");
        }

        var commander = new Commander();
        commander.UseCustomDisplayName = request.UseCustomDisplayName;
        if (!string.IsNullOrWhiteSpace(request.CardId))
        {
            var cardId = int.Parse(request.CardId);
            var card = await dbContext.CommanderCards.SingleOrDefaultAsync(c => c.Id == cardId, ct);
            if (card is null)
            {
                return TypedResults.NotFound("Commander card not found");
            }

            commander.CommanderCard = card;
        }

        if (!string.IsNullOrWhiteSpace(request.PartnerId))
        {
            var partnerId = int.Parse(request.PartnerId);
            var partner = await dbContext.CommanderCards.SingleOrDefaultAsync(c => c.Id == partnerId, ct);
            if (partner is null)
            {
                return TypedResults.NotFound("Partner card not found");
            }

            commander.PartnerCard = partner;
        }

        commander.CustomName = string.IsNullOrWhiteSpace(request.CustomName)
            ? commander.GetCardsNames()
            : request.CustomName;

        dbContext.Commanders.Add(commander);
        await dbContext.SaveChangesAsync(ct);

        var response = commander.ToDto();
        return TypedResults.Ok(response);
    }
}