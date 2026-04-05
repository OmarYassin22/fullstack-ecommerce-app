namespace BrilliantMind.Contracts.Order;

public record OrderRequest(
    //string UserId,
    IEnumerable<int> BookIds,
    decimal TotalPrice,
    string? Status, // e.g., Pending, Completed, Cancelled
    string? Address = null,
    string? PhoneNumber = null,
    string Email = null,
    string? Notes = null,
    string? TransactionId = null
    );
