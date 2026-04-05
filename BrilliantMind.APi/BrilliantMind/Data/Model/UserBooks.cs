using Microsoft.AspNetCore.Identity;

namespace BrilliantMind.Data.Model;

public class UserBooks
{
    public int Id { get; set; }
    public int? BookId { get; set; }
    public Book? Book { get; set; }
    public string? UserId { get; set; }
    public IdentityUser? User { get; set; }
}
