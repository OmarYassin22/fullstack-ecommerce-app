using BrilliantMind.Contracts.Order;
using Microsoft.AspNetCore.Identity;

namespace BrilliantMind.Interfaces;

public interface IOrderRepo
{
    Task<OrderResponse2> CreateOrderAsync(IdentityUser user, OrderRequest order);
    Task<bool> UserHaveBooksAsync(IdentityUser user, List<int> bookid);
    Task<OrderResponse> GetOrderByIdAsync(int id, IdentityUser user);
    Task<IEnumerable<OrderResponse>> GetOrdersByUserIdAsync(string userId);
    Task<IEnumerable<OrderResponse>> GetAllOrdersAsync();
    Task<bool> UpdateOrderAsync(int id, OrderRequest order, IdentityUser user);
    Task<bool> DeleteOrderAsync(int id, IdentityUser user);
}
