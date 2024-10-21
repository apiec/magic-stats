using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Commanders;

internal static class StartupExtensions
{
    public static IEndpointRouteBuilder AddCommanderEndpoints(this IEndpointRouteBuilder app)
    {
        var endpoints = app
            .MapGroup("/commanders")
            .WithTags("commanders");

        endpoints.MapEndpoint<CreateCommander>();
        endpoints.MapEndpoint<DeleteCommander>();
        endpoints.MapEndpoint<GetCommanders>();

        return app;
    }
}