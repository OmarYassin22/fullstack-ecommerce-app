using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BrilliantMind.Migrations
{
    /// <inheritdoc />
    public partial class removeStartandEndAge : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndAge",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "StartAge",
                table: "Books");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EndAge",
                table: "Books",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "StartAge",
                table: "Books",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
