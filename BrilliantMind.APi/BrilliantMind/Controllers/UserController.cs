using System.Security.Claims;
using BrilliantMind.Contracts.User;
using BrilliantMind.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BrilliantMind.Controllers;
[Route("me")]
[ApiController]
public class UserController(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager, IJwtService jwtService) : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager = userManager;
    private readonly RoleManager<IdentityRole> _roleManager = roleManager;
    private readonly IJwtService _jwtService = jwtService;

    [HttpPost("Register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (request is null)
        {
            return BadRequest("Request cannot be null.");
        }
        var user = new IdentityUser
        {
            UserName = request.Email,
            Email = request.Email
        };
        var result = await _userManager.CreateAsync(user, request.Password);
        if (result.Succeeded)
        {

            await _userManager.AddToRoleAsync(user, "User");
            return Ok("User Registerd Successfuly");
        }
        return BadRequest(result.Errors);
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return NotFound("User not found.");
        }
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            return Unauthorized("Invalid password.");
        }
        var result = await _jwtService.GenerateToken(user);
        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains("Admin"))
        {
            return Ok(new { result.token, result.expiresIn, isAdmin = true });

        }
        return Ok(new { result.token, result.expiresIn, isAdmin = false });

    }

    [HttpGet("Profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User not authenticated.");
        }
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return NotFound("User not found.");
        }
        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            Roles = roles
        });
    }

}
