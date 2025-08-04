using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MagicStats.Persistence.EfCore.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestPlayers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsGuest",
                table: "Players",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsGuest",
                table: "Players");
        }
    }
}
