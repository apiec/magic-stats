using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MagicStats.Persistence.EfCore.Migrations
{
    /// <inheritdoc />
    public partial class AddScryfallIdIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_CommanderCards_ScryfallId",
                table: "CommanderCards",
                column: "ScryfallId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CommanderCards_ScryfallId",
                table: "CommanderCards");
        }
    }
}
