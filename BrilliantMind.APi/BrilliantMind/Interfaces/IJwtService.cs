using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace BrilliantMind.Interfaces;

public interface IJwtService
{
    public Task<(string token, DateTime expiresIn)> GenerateToken(IdentityUser user);
    public Claim[] ValidateToke(string token);

}
