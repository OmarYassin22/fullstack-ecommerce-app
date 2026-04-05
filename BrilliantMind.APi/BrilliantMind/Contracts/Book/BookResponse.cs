namespace BeetElward.Contracts.Book;

public record BookResponse
(
    int Id,
    string Title,
    int? CategoryId,
    string? Category,
    string Description,
    decimal Price,
    decimal? Discount,
      int PagesNumber,
    IEnumerable<string> ImageUrls,
    string? PdfPath
);

public record BookResponseWithSellCount : BookResponse
{
    public int SellCount { get; init; } = 0;
    public decimal TotalEarning { get; init; } = 0;
     public BookResponseWithSellCount(int Id, string Title, int? CategoryId, string? Category, string Description, decimal Price, decimal? Discount, int PagesNumber, IEnumerable<string> ImageUrls, string? PdfPath,int sellCount,decimal totalEarning) : base(Id, Title, CategoryId, Category, Description, Price, Discount, PagesNumber, ImageUrls, PdfPath)
    {
        SellCount = sellCount;
        TotalEarning = totalEarning;
    }
}
 
//{
//    public decimal FinalPrice => Discount.HasValue ? Price - (Price * Discount.Value / 100) : Price;
//}