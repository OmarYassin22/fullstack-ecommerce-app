using Microsoft.AspNetCore.Identity;

namespace BrilliantMind.Data.Model;

public class Payment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; }
    public string UserId { get; set; }
    public IdentityUser User { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? PayPalOrderId { get; set; } // PayPal's order ID
    public string? TransactionId { get; set; } // PayPal's transaction ID
    public string? PayerEmail { get; set; }
    public string? PayerName { get; set; }
    public string? PaymentGatewayResponse { get; set; } // Store full response
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string? FailureReason { get; set; }
    public int RetryCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}



public enum PaymentStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    Cancelled = 4,
    Refunded = 5,
    PartiallyRefunded = 6
}