using MagicStats.Api.Shared;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace MagicStats.Api.Home;

public class GetHomePageStats : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app) => app
        .MapGet("/stats", Handle);

    private record Response(
        int GamesTotal,
        int Meetings,
        float? GamesPerMeeting,
        PlayerWithMostGamesDto? MostGamesPlayer,
        CommanderWithMostGamesDto? MostGamesCommander);

    private record PlayerWithMostGamesDto(string Id, string Name, int GamesPlayed);

    private record CommanderWithMostGamesDto(string Id, string Name, int GamesPlayed);

    private static async Task<Ok<Response>> Handle(StatsDbContext dbContext, CancellationToken ct)
    {
        var calculator = new HomePageStatsCalculator(dbContext);

        var gamesTotal = await calculator.GetGamesTotal(ct);
        var meetingsTotal = await calculator.GetMeetingsTotal(ct);
        var playerWithMostGames = await calculator.GetPlayerWithMostGames(ct);
        var commanderWithMostGames = await calculator.GetCommanderWithMostGames(ct);

        var response = new Response(
            gamesTotal,
            meetingsTotal,
            meetingsTotal > 0 ? (float)gamesTotal / meetingsTotal : null,
            playerWithMostGames,
            commanderWithMostGames);
        return TypedResults.Ok(response);
    }

    class HomePageStatsCalculator
    {
        private readonly StatsDbContext _dbContext;

        public HomePageStatsCalculator(StatsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<int> GetGamesTotal(CancellationToken ct)
        {
            return await _dbContext.Games.CountAsync(ct);
        }

        public async Task<int> GetMeetingsTotal(CancellationToken ct)
        {
            return await _dbContext.Database.SqlQuery<int>(
                    $"""
                     SELECT COUNT(1) Value
                     FROM (SELECT 1 c
                           FROM Games g
                           GROUP BY DATE(g.PlayedAt, 'unixepoch'))
                     GROUP BY c
                     """)
                .FirstOrDefaultAsync(ct);
        }

        public async Task<PlayerWithMostGamesDto?> GetPlayerWithMostGames(CancellationToken ct)
        {
            return await _dbContext.Database.SqlQuery<PlayerWithMostGamesDto>(
                    $"""
                     SELECT p.Id, p.Name, gamesPlayed
                     FROM Players p
                     INNER JOIN (SELECT PlayerId, COUNT(1) gamesPlayed
                         FROM Participants
                         GROUP BY PlayerId
                         ORDER BY gamesPlayed DESC
                         LIMIT 1) ON p.Id = PlayerId
                     """)
                .FirstOrDefaultAsync(ct);
        }

        public async Task<CommanderWithMostGamesDto?> GetCommanderWithMostGames(CancellationToken ct)
        {
            return await _dbContext.Database.SqlQuery<CommanderWithMostGamesDto>(
                    $"""
                     SELECT c.Id,
                     (CASE WHEN c.UseCustomDisplayName OR cc.Name IS NULL
                         THEN c.CustomName
                         ELSE (
                             cc.NAME ||
                             CASE WHEN pc.Name IS NULL
                                 THEN ''
                                 ELSE ' // ' || pc.Name
                             END)
                     END) Name,
                     gamesPlayed
                     FROM Commanders c
                         INNER JOIN (SELECT CommanderId, COUNT(1) gamesPlayed
                                     FROM Participants
                                     GROUP BY CommanderId
                                     ORDER BY gamesPlayed DESC
                                     LIMIT 1) ON c.Id = CommanderId
                         LEFT JOIN CommanderCards cc ON c.CommanderCardId = cc.Id
                         LEFT JOIN CommanderCards pc ON c.PartnerCardId = pc.Id
                     """)
                .FirstOrDefaultAsync(ct);
        }
    }
}