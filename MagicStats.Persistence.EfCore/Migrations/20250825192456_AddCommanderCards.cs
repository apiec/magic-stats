using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MagicStats.Persistence.EfCore.Migrations
{
    /// <inheritdoc />
    public partial class AddCommanderCards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CommanderCardId",
                table: "Commanders",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PartnerCardId",
                table: "Commanders",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CommanderCards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ScryfallId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    ScryfallUri = table.Column<string>(type: "TEXT", nullable: false),
                    PngUri = table.Column<string>(type: "TEXT", nullable: false),
                    BorderCropUri = table.Column<string>(type: "TEXT", nullable: false),
                    ArtCropUri = table.Column<string>(type: "TEXT", nullable: false),
                    LargeUri = table.Column<string>(type: "TEXT", nullable: false),
                    NormalUri = table.Column<string>(type: "TEXT", nullable: false),
                    SmallUri = table.Column<string>(type: "TEXT", nullable: false),
                    OtherFacePngUri = table.Column<string>(type: "TEXT", nullable: true),
                    OtherFaceBorderCropUri = table.Column<string>(type: "TEXT", nullable: true),
                    OtherFaceArtCropUri = table.Column<string>(type: "TEXT", nullable: true),
                    OtherFaceLargeUri = table.Column<string>(type: "TEXT", nullable: true),
                    OtherFaceNormalUri = table.Column<string>(type: "TEXT", nullable: true),
                    OtherFaceSmallUri = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommanderCards", x => x.Id);
                    table.UniqueConstraint("AK_CommanderCards_ScryfallId", x => x.ScryfallId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Commanders_CommanderCardId",
                table: "Commanders",
                column: "CommanderCardId");

            migrationBuilder.CreateIndex(
                name: "IX_Commanders_PartnerCardId",
                table: "Commanders",
                column: "PartnerCardId");

            migrationBuilder.CreateIndex(
                name: "IX_CommanderCards_Name",
                table: "CommanderCards",
                column: "Name");

            migrationBuilder.AddForeignKey(
                name: "FK_Commanders_CommanderCards_CommanderCardId",
                table: "Commanders",
                column: "CommanderCardId",
                principalTable: "CommanderCards",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Commanders_CommanderCards_PartnerCardId",
                table: "Commanders",
                column: "PartnerCardId",
                principalTable: "CommanderCards",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Commanders_CommanderCards_CommanderCardId",
                table: "Commanders");

            migrationBuilder.DropForeignKey(
                name: "FK_Commanders_CommanderCards_PartnerCardId",
                table: "Commanders");

            migrationBuilder.DropTable(
                name: "CommanderCards");

            migrationBuilder.DropIndex(
                name: "IX_Commanders_CommanderCardId",
                table: "Commanders");

            migrationBuilder.DropIndex(
                name: "IX_Commanders_PartnerCardId",
                table: "Commanders");

            migrationBuilder.DropColumn(
                name: "CommanderCardId",
                table: "Commanders");

            migrationBuilder.DropColumn(
                name: "PartnerCardId",
                table: "Commanders");
        }
    }
}
