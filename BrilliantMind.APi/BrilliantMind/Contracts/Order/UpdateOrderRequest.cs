namespace BrilliantMind.Contracts.Order;

public record UpdateOrderRequest(
    IEnumerable<int> BookIds // List of book IDs to update the order with
    );
