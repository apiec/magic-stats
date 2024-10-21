using Microsoft.AspNetCore.Routing;

namespace MagicStats.Api.Shared;

public interface IEndpoint
{
    static abstract void Map(IEndpointRouteBuilder app);
}