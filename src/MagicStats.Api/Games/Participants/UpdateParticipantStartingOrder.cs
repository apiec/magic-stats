using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Games.Participants;

public class UpdateParticipantStartingOrder : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPost("{gameId:int}/participants/starting-order", Handle)
        .WithSummary("Update the starting order of the participants. Must update all participants at the same time.");

    public record Request(IReadOnlyList<int> ParticipantStartingOrder);

    private static async Task<Results<Ok, NotFound>> Handle(
        [FromRoute] int gameId,
        [FromBody] Request request,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        var game = await dbContext.Games
            .Include(g => g.Participants)
            .SingleOrDefaultAsync(g => g.Id == gameId, ct);

        if (game is null)
        {
            return TypedResults.NotFound();
        }

        for (var i = 0; i < request.ParticipantStartingOrder.Count; i++)
        {
            var playerId = request.ParticipantStartingOrder[i];
            var participant = game.Participants.SingleOrDefault(p => p.PlayerId == playerId);
            if (participant is null)
            {
                return TypedResults.NotFound(); // todo: messages on not found
            }

            participant.StartingOrder = i;
        }

        dbContext.Update(game);

        await dbContext.SaveChangesAsync(ct);
        return TypedResults.Ok();
    }
}