namespace BrilliantMind.Data.Model;

public class Book
{
    public int Id { get; set; }
    public string Title { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; }
    public ICollection<UserBooks> Users { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int PagesNumber { get; set; }
    public List<BookImages?> ImageUrls { get; set; }
    public string? PdfPath { get; set; } // Add PDF path property

    public decimal? Discount { get; set; }
    public decimal? FinalPrice => Discount is not null ? Price - ((Price * Discount) / 100) : Price;

}
