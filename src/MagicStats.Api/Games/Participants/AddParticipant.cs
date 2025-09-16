using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Games.Participants;

public class AddParticipant : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPost("/{gameId:int}/participants", Handle)
        .WithName("Adds a new participant to a game");

    public record Request(int PlayerId, int CommanderId, int? StartingOrder, int? Placement);

    private static async Task<Results<Ok<ParticipantDto>, NotFound<string>>> Handle(
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
            return TypedResults.NotFound($"Game with id: {gameId} not found");
        }

        var participant = new Participant
        {
            GameId = gameId,
            PlayerId = request.PlayerId,
            CommanderId = request.CommanderId,
            StartingOrder = request.StartingOrder ?? game.Participants.Count,
            Placement = request.Placement ?? game.Participants.Count,
        };

        foreach (var participantToMove in game.Participants.Where(p => p.Placement >= participant.Placement))
        {
            participantToMove.Placement += 1;
        }

        foreach (var participantToMove in game.Participants.Where(p => p.StartingOrder >= participant.Placement))
        {
            participantToMove.StartingOrder += 1;
        }

        game.Participants.Add(participant);
        await dbContext.SaveChangesAsync(ct);

        var queried = await dbContext.Participants
            .Include(p => p.Commander)
            .Include(p => p.Player)
            .SingleAsync(p => p.GameId == gameId && p.PlayerId == request.PlayerId, ct);

        return TypedResults.Ok(GameMapper.ToDto(queried));
    }
}