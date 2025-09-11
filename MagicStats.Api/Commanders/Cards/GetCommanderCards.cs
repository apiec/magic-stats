using MagicStats.Api.Games;
using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Commanders.Cards;

public class GetCommanderCards : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/cards", Handle);

    public record Response(IReadOnlyCollection<CardDto> Cards);

    private static async Task<Results<Ok<Response>, NotFound>> Handle(
        [FromQuery] string? name,
        [FromQuery] int? skip,
        [FromQuery] int? take,
        StatsDbContext dbContext,
        CancellationToken ct)
    {
        skip ??= 0;
        take ??= 20;
        name = name?.Trim();

        var query = dbContext.CommanderCards.AsQueryable();
        if (!string.IsNullOrWhiteSpace(name))
        {
            query = query.Where(c => EF.Functions.Like(c.Name, $"%{name}%"));
        }

        var result = await query
            .OrderBy(c => c.Name)
            .Skip(skip.Value)
            .Take(take.Value)
            .ToArrayAsync(ct);

        return TypedResults.Ok(
            new Response(result
                .Select(c => c.ToDto())
                .ToArray()));
    }
}