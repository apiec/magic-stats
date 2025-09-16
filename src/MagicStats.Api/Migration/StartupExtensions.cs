using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Migration;

public static class StartupExtensions
{
    public static IEndpointRouteBuilder AddMigrationEndpoints(this IEndpointRouteBuilder app)
    {
        var endpoints = app
            .MapGroup("/migration")
            .WithTags("migration")
            .DisableAntiforgery();

        endpoints.MapEndpoint<ImportGamesFromCsv>();
        endpoints.MapEndpoint<ImportCardsFromScryfallJson>();

        return app;
    }
}