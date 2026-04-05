using System.Security.Claims;
using BeetElward.Contracts.Order;
using BeetElward.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BeetElward.Controllers;
[Route("api/[controller]")]
[Authorize]
[ApiController]
public class OrderController(IOrderRepo repo, UserManager<IdentityUser> userManager) : ControllerBase
{
    private readonly IOrderRepo _repo = repo;
    private readonly UserManager<IdentityUser> _userManager = userManager;

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] OrderRequest orderRequest)
    {
        if (orderRequest is null)
        {
            return BadRequest("Order request cannot be null.");
        }
        var user = GetCurrentUser();
        if (!await _repo.UserHaveBooksAsync(user, orderRequest.BookIds.ToList()))
        {
            return BadRequest("You already have these books in your Liberary.");
        }
        var order = await _repo.CreateOrderAsync(user, orderRequest);
        if (order is null)
        {
            return Conflict("Order could not be created.");
        }
        //return Ok(order.Id);
        return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var res = await _repo.GetAllOrdersAsync();
        if (res is null)
            return NotFound();
        return Ok(res);

    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderById(int id)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return Unauthorized("User not found.");
        }
        var order = await _repo.GetOrderByIdAsync(id, user);
        if (order is null)
        {
            return NotFound($"Order not found.");
        }
        return Ok(order);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return Unauthorized("User not found.");
        }
        var result = await _repo.DeleteOrderAsync(id, user);
        if (!result)
        {
            return NotFound($"Order with id {id} not found or you are not authorized to delete it.");
        }
        return NoContent(); // 204 No Content
    }
    [HttpGet("user-orders")]
    public async Task<IActionResult> GetUserOrders()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized("User not found.");
        }
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return Unauthorized("User not found.");
        }
        var orders = await _repo.GetOrdersByUserIdAsync(user.Id);
        if (orders is null || !orders.Any())
        {
            return NotFound("No orders found for the user.");
        }
        return Ok(orders);
    }
    [HttpPut("{id}")]
    //[Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderRequest statusUpdateRequest)
    {
        if (statusUpdateRequest is null)
        {
            return BadRequest("Status update request cannot be null.");
        }
        var user = GetCurrentUser();
        var order = await _repo.UpdateOrderAsync(id, statusUpdateRequest, user);
        if (order is false)
        {
            return NotFound($"Order with id {id} not found.");
        }
        return Ok(order);
    }
    private IdentityUser? GetCurrentUser()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email))
        {
            return null;
        }
        return _userManager.FindByEmailAsync(email).Result;
    }
}
