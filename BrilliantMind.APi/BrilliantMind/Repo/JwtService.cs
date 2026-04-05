using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using BrilliantMind.Helper;
using BrilliantMind.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace BrilliantMind.Repo;

public class JwtService(IOptions<JwtOptions> options, UserManager<IdentityUser> userManager) : IJwtService
{
    private readonly JwtOptions _options = options.Value;
    private readonly UserManager<IdentityUser> _userManager = userManager;

    public async Task<(string token, DateTime expiresIn)> GenerateToken(IdentityUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        Claim[] claims =
        {
            new (JwtRegisteredClaimNames.Sub,user.Id),
            new (JwtRegisteredClaimNames.Email,user.Email),
            new (JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString()),
             new (JwtRegisteredClaimNames.GivenName, user.UserName!),
             new (nameof(roles),JsonSerializer.Serialize(roles),JsonClaimValueTypes.JsonArray)


        };
        var symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));

        var signingCredentials = new SigningCredentials(symmetricSecurityKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
           claims: claims,
            expires: DateTime.Now.AddMinutes(_options.LifeTime),
            signingCredentials: signingCredentials);
        return (new JwtSecurityTokenHandler().WriteToken(token).ToString(), DateTime.Now.AddMinutes(_options.LifeTime));

    }

    public Claim[] ValidateToke(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key)),
            ValidateIssuer = true,
            ValidIssuer = _options.Issuer,
            ValidateAudience = true,
            ValidAudience = _options.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero

        };
        try
        {
            var principal = tokenHandler.ValidateToken(token, validationParameters, out var r);

            return principal.Claims.ToArray();
        }
        catch (Exception ex)
        {
            throw new SecurityTokenException("Invalid token", ex);
        }
    }


}
