namespace BrilliantMind.Contracts.User;

public record RegisterRequest(
    string Email,
    string Password,
    string UserName,

    string PhoneNumber = default!


    );
