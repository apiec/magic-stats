using MagicStats.Api.Games;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Commanders;

public class UpdateCommander : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPut("/{commanderId}", Handle)
        .WithSummary("Update a commander");

    public record Request(bool UseCustomDisplayName, string? CustomName, string? CardId, string? PartnerId);

    private static async Task<Results<Ok<CommanderDto>, NotFound<string>>> Handle(
        [FromRoute] string commanderId,
        Request request,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var intId = int.Parse(commanderId);
        var commander = await dbContext.Commanders
            .Include(c => c.CommanderCard)
            .Include(c => c.PartnerCard)
            .SingleOrDefaultAsync(p => p.Id == intId, ct);
        if (commander is null)
        {
            return TypedResults.NotFound("Commander not found");
        }

        commander.UseCustomDisplayName = request.UseCustomDisplayName;
        if (!string.IsNullOrWhiteSpace(request.CustomName))
        {
            commander.CustomName = request.CustomName;
        }

        if (string.IsNullOrWhiteSpace(request.CardId))
        {
            commander.CommanderCardId = null;
            commander.CommanderCard = null;
        }
        else if (request.CardId != commander.CommanderCardId.ToString())
        {
            var cardId = int.Parse(request.CardId);
            var card = await dbContext.CommanderCards.SingleOrDefaultAsync(c => c.Id == cardId, ct);
            if (card is null)
            {
                return TypedResults.NotFound("Commander card not found");
            }

            commander.CommanderCardId = cardId;
            commander.CommanderCard = card;
        }

        if (string.IsNullOrWhiteSpace(request.PartnerId))
        {
            commander.PartnerCardId = null;
            commander.PartnerCard = null;
        }
        else if (request.PartnerId != commander.PartnerCardId.ToString())
        {
            var partnerId = int.Parse(request.PartnerId);
            var partner = await dbContext.CommanderCards.SingleOrDefaultAsync(c => c.Id == partnerId, ct);
            if (partner is null)
            {
                return TypedResults.NotFound("Partner card not found");
            }

            commander.PartnerCardId = partnerId;
            commander.PartnerCard = partner;
        }

        await dbContext.SaveChangesAsync(ct);

        var dto = commander.ToDto();
        return TypedResults.Ok(commander.ToDto());
    }
}