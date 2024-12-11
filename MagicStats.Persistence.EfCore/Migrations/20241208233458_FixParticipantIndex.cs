using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MagicStats.Persistence.EfCore.Migrations
{
    /// <inheritdoc />
    public partial class FixParticipantIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Participants_PlayerId_Placement",
                table: "Participants");

            migrationBuilder.DropIndex(
                name: "IX_Participants_PlayerId_StartingOrder",
                table: "Participants");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_GameId_PlayerId_Placement",
                table: "Participants",
                columns: new[] { "GameId", "PlayerId", "Placement" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Participants_GameId_PlayerId_StartingOrder",
                table: "Participants",
                columns: new[] { "GameId", "PlayerId", "StartingOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Participants_PlayerId",
                table: "Participants",
                column: "PlayerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Participants_GameId_PlayerId_Placement",
                table: "Participants");

            migrationBuilder.DropIndex(
                name: "IX_Participants_GameId_PlayerId_StartingOrder",
                table: "Participants");

            migrationBuilder.DropIndex(
                name: "IX_Participants_PlayerId",
                table: "Participants");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_PlayerId_Placement",
                table: "Participants",
                columns: new[] { "PlayerId", "Placement" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Participants_PlayerId_StartingOrder",
                table: "Participants",
                columns: new[] { "PlayerId", "StartingOrder" },
                unique: true);
        }
    }
}
