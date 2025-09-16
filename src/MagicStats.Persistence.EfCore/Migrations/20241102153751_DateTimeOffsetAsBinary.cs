using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MagicStats.Persistence.EfCore.Migrations
{
    /// <inheritdoc />
    public partial class DateTimeOffsetAsBinary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Participants_GameId",
                table: "Participants");

            migrationBuilder.DropIndex(
                name: "IX_Participants_PlayerId",
                table: "Participants");

            migrationBuilder.AlterColumn<int>(
                name: "Placement",
                table: "Participants",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "PlayedAt",
                table: "Games",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(DateTimeOffset),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<long>(
                name: "LastModified",
                table: "Games",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(DateTimeOffset),
                oldType: "TEXT");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_GameId_PlayerId",
                table: "Participants",
                columns: new[] { "GameId", "PlayerId" },
                unique: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Participants_GameId_PlayerId",
                table: "Participants");

            migrationBuilder.DropIndex(
                name: "IX_Participants_PlayerId_Placement",
                table: "Participants");

            migrationBuilder.DropIndex(
                name: "IX_Participants_PlayerId_StartingOrder",
                table: "Participants");

            migrationBuilder.AlterColumn<int>(
                name: "Placement",
                table: "Participants",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "PlayedAt",
                table: "Games",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "LastModified",
                table: "Games",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "INTEGER");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_GameId",
                table: "Participants",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_PlayerId",
                table: "Participants",
                column: "PlayerId");
        }
    }
}