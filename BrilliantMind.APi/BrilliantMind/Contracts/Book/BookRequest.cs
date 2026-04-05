namespace BrilliantMind.Contracts.Book;

public record BookRequest(
    string Title,
    string Description,
    decimal Price,
    int StartAge,
    int EndAge,
    decimal? Discount,
    IFormFile? Pdf,

   int PagesNumber,
    string CategoryName,
        IEnumerable<IFormFile?> Images = null

    );