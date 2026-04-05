using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BrilliantMind.Migrations
{
    /// <inheritdoc />
    public partial class AllownullableForBookCategoryRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Books_Categories_CategroyId",
                table: "Books");

            migrationBuilder.DropIndex(
                name: "IX_Books_CategroyId",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "CategroyId",
                table: "Books");

            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Books",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Books_CategoryId",
                table: "Books",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Books_Categories_CategoryId",
                table: "Books",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Books_Categories_CategoryId",
                table: "Books");

            migrationBuilder.DropIndex(
                name: "IX_Books_CategoryId",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Books");

            migrationBuilder.AddColumn<int>(
                name: "CategroyId",
                table: "Books",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Books_CategroyId",
                table: "Books",
                column: "CategroyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Books_Categories_CategroyId",
                table: "Books",
                column: "CategroyId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
