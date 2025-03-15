using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using MagicStats.Persistence.EfCore.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Games;

public class CreateGame : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapPost("/", Handle)
        .WithSummary("Create a new game");

    public record Request(
        DateTimeOffset PlayedAt,
        string? HostId,
        int? TurnCount,
        IReadOnlyList<ParticipantDto> Participants);

    public record ParticipantDto(string PlayerId, string CommanderId, int StartingOrder, int Placement);

    private static async Task<Ok<GameDto>> Handle(
        [FromBody] Request request,
        StatsDbContext dbContext,
        TimeProvider timeProvider,
        CancellationToken ct)
    {
        var now = timeProvider.GetUtcNow();
        var game = new Game
        {
            LastModified = now,
            PlayedAt = request.PlayedAt,
            HostId = request.HostId is not null ? int.Parse(request.HostId) : null,
            TurnCount = request.TurnCount,
            Participants = request.Participants
                .Select(p =>
                    new Participant
                    {
                        PlayerId = int.Parse(p.PlayerId),
                        CommanderId = int.Parse(p.CommanderId),
                        StartingOrder = p.StartingOrder,
                        Placement = p.Placement,
                    })
                .ToList(),
        };

        dbContext.Games.Add(game);
        await dbContext.SaveChangesAsync(ct);

        var response = GameMapper.MapGame(game);
        return TypedResults.Ok(response);
    }
}