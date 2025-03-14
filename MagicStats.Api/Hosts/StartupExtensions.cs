using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Hosts;

public static class StartupExtensions
{
    public static IEndpointRouteBuilder AddHostsEndpoints(this IEndpointRouteBuilder app)
    {
        var endpoints = app
            .MapGroup("/hosts")
            .WithTags("hosts");

        endpoints.MapEndpoint<GetHosts>();
        endpoints.MapEndpoint<GetHostsWithStats>();

        endpoints.MapEndpoint<CreateHost>();
        endpoints.MapEndpoint<DeleteHost>();

        return app;
    }
}