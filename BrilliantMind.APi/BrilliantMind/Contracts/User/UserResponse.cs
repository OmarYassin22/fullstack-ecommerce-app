using BrilliantMind.Contracts.Book;

namespace BrilliantMind.Contracts.User;

public record UserResponse(
    string Id,
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    string PhoneNumber,
    IEnumerable<BookResponse> Books = default!

    );