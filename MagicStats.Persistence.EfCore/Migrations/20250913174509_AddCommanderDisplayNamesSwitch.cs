using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MagicStats.Persistence.EfCore.Migrations
{
    /// <inheritdoc />
    public partial class AddCommanderDisplayNamesSwitch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Commanders",
                newName: "CustomName");

            migrationBuilder.RenameIndex(
                name: "IX_Commanders_Name",
                table: "Commanders",
                newName: "IX_Commanders_CustomName");

            migrationBuilder.AddColumn<bool>(
                name: "UseCustomDisplayName",
                table: "Commanders",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UseCustomDisplayName",
                table: "Commanders");

            migrationBuilder.RenameColumn(
                name: "CustomName",
                table: "Commanders",
                newName: "Name");

            migrationBuilder.RenameIndex(
                name: "IX_Commanders_CustomName",
                table: "Commanders",
                newName: "IX_Commanders_Name");
        }
    }
}
