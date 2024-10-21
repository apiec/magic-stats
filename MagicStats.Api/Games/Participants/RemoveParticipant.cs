using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Games.Participants;

public class RemoveParticipant : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapDelete("{gameId:int}/participants/{playerId:int}", Handle);

    private static async Task<Results<Ok, NotFound>> Handle(
        [FromRoute] int gameId,
        [FromRoute] int playerId,
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

        var participantToRemove = game.Participants.SingleOrDefault(p => p.PlayerId == playerId);
        if (participantToRemove is null)
        {
            return TypedResults.NotFound();
        }

        game.Participants.Remove(participantToRemove);
        foreach (var participant in game.Participants.Where(p => p.Placement > participantToRemove.Placement))
        {
            participant.Placement -= 1;
        }
        foreach (var participant in game.Participants.Where(p => p.StartingOrder > participantToRemove.StartingOrder))
        {
            participant.StartingOrder -= 1;
        }
        dbContext.Remove(participantToRemove);

        await dbContext.SaveChangesAsync(ct);
        return TypedResults.Ok();
    }
}