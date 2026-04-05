using Microsoft.AspNetCore.Identity;

namespace BrilliantMind.Interfaces;

public interface IUserRepo
{
    Task<IEnumerable<IdentityUser>> GetAllUsersAsync();
    Task<IdentityUser> GetUserByIdAsync(int id);
    Task<IdentityUser> GetUserByEmailAsync(string email);
    Task<IdentityUser> AddUserAsync(IdentityUser user);
    Task<IdentityUser> UpdateUserAsync(IdentityUser user);
    Task<bool> DeleteUserAsync(int id);
    Task<bool> DeleteUserAsync(IdentityUser user);

}
