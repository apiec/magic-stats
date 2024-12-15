using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Home;

internal static class StartupExtensions
{
    public static IEndpointRouteBuilder AddHomeEndpoints(this IEndpointRouteBuilder app)
    {
        var endpoints = app
            .MapGroup("/home")
            .WithTags("home");

        endpoints.MapEndpoint<GetHomePageStats>();

        return app;
    }
}