namespace BrilliantMind.Contracts.Category;

public record CategoryResponse(
      int Id,
        string Title,
        string Description,
        IEnumerable<string?> Books
  );

