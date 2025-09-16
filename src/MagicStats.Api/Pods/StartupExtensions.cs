using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Pods;

public static class StartupExtensions
{
    public static IEndpointRouteBuilder AddPodsEndpoints(this IEndpointRouteBuilder app)
    {
        var endpoints = app
            .MapGroup("/pods")
            .WithTags("pods");

        endpoints.MapEndpoint<GetPods>();
        return app;
    }
}