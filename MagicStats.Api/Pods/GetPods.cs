using MagicStats.Api.Games;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Pods;

public class GetPods : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/", Handle);


    public record Response(IReadOnlyCollection<PodDto> Pods);

    public record PodDto(IReadOnlyCollection<PlayerDto> Players, int Games);

    private record PodsRaw(string PlayerIds, int Games);

    private static async Task<Ok<Response>> Handle(StatsDbContext dbContext, CancellationToken ct)
    {
        var players = await dbContext.Players
            .ToDictionaryAsync(
                pl => pl.Id.ToString(),
                pl => pl.ToDto(),
                ct);

        var pods = await dbContext.Database
            .SqlQuery<PodsRaw>(
                $"""
                 SELECT PlayerIds, COUNT(1) Games
                 FROM (SELECT GROUP_CONCAT(PlayerId, ';') PlayerIds
                     FROM Participants
                     GROUP BY GameId)
                 GROUP BY PlayerIds
                 """)
            .ToArrayAsync(ct);

        var podDtos = pods.Select(p =>
            {
                var playerIds = p.PlayerIds.Split(';');
                var playersInPod = playerIds.Select(id => players[id]).ToArray();
                return new PodDto(playersInPod, p.Games);
            })
            .Where(p => p.Players.Count > 1)
            .ToArray();

        return TypedResults.Ok(new Response(podDtos));
    }
}