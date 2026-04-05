using System.Security.Claims;
using BeetElward.Contracts.Payment;
using BeetElward.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;


namespace BeetElward.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PaymentController(IPayPalService payPalService, UserManager<IdentityUser> userManager) : ControllerBase
{
    private readonly IPayPalService _payPalService = payPalService;
    private readonly UserManager<IdentityUser> _userManager = userManager;

    [HttpPost("create")]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        if (request == null)
        {
            return BadRequest("Payment request cannot be null");
        }

        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
        {
            return Unauthorized("User not found");
        }

        var result = await _payPalService.CreateOrderAsync(userId, request);

        if (result.Status == Data.Model.PaymentStatus.Pending)
        {
            return Ok(result);
        }
        else
        {
            return BadRequest(result);
        }
    }

    [HttpPost("capture/{paypalORderId}")]
    public async Task<IActionResult> CapturePayment(string paypalORderId)
    {
        if (paypalORderId == null || string.IsNullOrEmpty(paypalORderId))
        {
            return BadRequest("PayPal Order ID is required");
        }

        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
        {
            return Unauthorized("User not found");
        }

        var result = await _payPalService.CaptureOrderAsync(paypalORderId);

        if (result.Status == Data.Model.PaymentStatus.Completed)
        {
            return Ok(result);
        }
        else
        {
            return BadRequest(result);
        }
    }

    [HttpPost("refund")]
    public async Task<IActionResult> RefundPayment([FromBody] RefundPaymentRequest request)
    {
        // TODO: Implement refund logic
        return Ok();
    }

    [HttpGet("details/{payPalOrderId}")]
    public async Task<IActionResult> GetPaymentDetails(string payPalOrderId)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
        {
            return Unauthorized("User not found");
        }

        var payment = await _payPalService.GetPaymentDetailsAsync(payPalOrderId);

        if (payment == null)
        {
            return NotFound("Payment not found");
        }

        return Ok(payment);
    }

    private async Task<string?> GetCurrentUserIdAsync()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email)) return null;

        var user = await _userManager.FindByEmailAsync(email);
        return user?.Id;
    }
}