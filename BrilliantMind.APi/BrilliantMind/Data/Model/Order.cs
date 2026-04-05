using Microsoft.AspNetCore.Identity;

namespace BrilliantMind.Data.Model;

public class Order
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public IdentityUser User { get; set; }
    public ICollection<Book> Books { get; set; }
    public decimal? TotalPrice { get; set; }
    public OrderStatus Status { get; set; } // e.g., Pending, Completed, Cancelled
    public string? Address { get; set; } // Optional address for delivery
    public string? PhoneNumber { get; set; } // Optional phone number for contact
    public string? Email { get; set; } = string.Empty;
    public string? Notes { get; set; } // Optional notes for the order
    public string? TransactionId { get; set; } // Optional transaction ID for payment tracking
    public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }
    public IdentityUser? CreatedBy { get; set; }
    public IdentityUser? UpdatedBy { get; set; }
    public bool Active { get; set; } = true; // Indicates if the order is active or deleted




}

public enum OrderStatus
{
    Pending,
    Completed,
    Cancelled
}
