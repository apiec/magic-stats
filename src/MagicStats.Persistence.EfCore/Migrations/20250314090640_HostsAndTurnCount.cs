using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MagicStats.Persistence.EfCore.Migrations
{
    /// <inheritdoc />
    public partial class HostsAndTurnCount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HostId",
                table: "Games",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TurnCount",
                table: "Games",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Hosts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false),
                    Irl = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hosts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Games_HostId",
                table: "Games",
                column: "HostId");

            migrationBuilder.CreateIndex(
                name: "IX_Hosts_Irl",
                table: "Hosts",
                column: "Irl");

            migrationBuilder.CreateIndex(
                name: "IX_Hosts_Name",
                table: "Hosts",
                column: "Name");

            migrationBuilder.Sql("""
                INSERT INTO Hosts (Id, Name, Irl) VALUES (0, 'Default', true)
                """);

            migrationBuilder.AddForeignKey(
                name: "FK_Games_Hosts_HostId",
                table: "Games",
                column: "HostId",
                principalTable: "Hosts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Games_Hosts_HostId",
                table: "Games");

            migrationBuilder.DropTable(
                name: "Hosts");

            migrationBuilder.DropIndex(
                name: "IX_Games_HostId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "HostId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "TurnCount",
                table: "Games");
        }
    }
}
