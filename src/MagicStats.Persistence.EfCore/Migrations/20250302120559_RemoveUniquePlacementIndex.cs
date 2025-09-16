using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MagicStats.Persistence.EfCore.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUniquePlacementIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Participants_GameId_PlayerId_Placement",
                table: "Participants");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_GameId_PlayerId_Placement",
                table: "Participants",
                columns: new[] { "GameId", "PlayerId", "Placement" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Participants_GameId_PlayerId_Placement",
                table: "Participants");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_GameId_PlayerId_Placement",
                table: "Participants",
                columns: new[] { "GameId", "PlayerId", "Placement" },
                unique: true);
        }
    }
}
