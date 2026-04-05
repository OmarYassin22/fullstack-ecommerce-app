using BrilliantMind.Contracts.Book;
using BrilliantMind.Contracts.User;

namespace BrilliantMind.Contracts.Order;

public record OrderResponse(
    int Id,
    bool Active,
    string UserId,
    UserResponse User,
    IEnumerable<BookResponse> Books,
    decimal TotalPrice,
    string Status, // e.g., Pending, Completed, Cancelled
    string? Address,
    string? PhoneNumber,
    string? Email,
    string? Notes,
    string? TransactionId
    );

public record OrderResponse2(
    int Id,
    bool Active,
    string UserId,
    UserResponse User,
    IEnumerable<string> Books,
    decimal TotalPrice,
    string Status, // e.g., Pending, Completed, Cancelled
    string? Address,
    string? PhoneNumber,
    string? Email,
    string? Notes,
    string? TransactionId
    );
//{
//    public static OrderResponse FromOrder(Order order)
//        => new(order.Id, order.UserId, order.ProductName, order.Quantity, order.Price, order.OrderDate);
//};
