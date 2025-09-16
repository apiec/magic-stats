using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Games.Participants;

public class UpdateParticipantPlacements : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPost("{gameId:int}/participants/placement", Handle)
        .WithSummary("Update the placements of the participants. Must update all participants at the same time.");

    public record Request(IReadOnlyDictionary<int, int> ParticipantPlacements);

    private static async Task<Results<Ok, NotFound, BadRequest<string>>> Handle(
        [FromRoute] int gameId,
        [FromBody] Request request,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        if (!ValidatePlacements(request))
        {
            return TypedResults.BadRequest("Wrong placements");
        }

        var game = await dbContext.Games
            .Include(g => g.Participants)
            .SingleOrDefaultAsync(g => g.Id == gameId, ct);

        if (game is null)
        {
            return TypedResults.NotFound();
        }

        foreach (var (playerId, placement) in request.ParticipantPlacements)
        {
            var participant = game.Participants.SingleOrDefault(p => p.PlayerId == playerId);
            if (participant is null)
            {
                return TypedResults.NotFound();
            }

            participant.Placement = placement;
        }

        dbContext.Update(game);

        await dbContext.SaveChangesAsync(ct);
        return TypedResults.Ok();
    }

    private static bool ValidatePlacements(Request request)
    {
        var orderedPlacements = request.ParticipantPlacements.Values.OrderDescending();

        var lastPlacement = request.ParticipantPlacements.Count;
        var drawCount = 1;

        foreach (var placement in orderedPlacements)
        {
            if (placement == lastPlacement)
            {
                drawCount += 1;
                continue;
            }

            if (lastPlacement - placement != drawCount)
            {
                return false;
            }

            lastPlacement = placement;
            drawCount = 1;
        }

        return lastPlacement + 1 == drawCount;
    }
}