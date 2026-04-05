using BrilliantMind.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace BrilliantMind.Repo;

public class UserRepo : IUserRepo
{
    public Task<IdentityUser> AddUserAsync(IdentityUser user)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteUserAsync(int id)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteUserAsync(IdentityUser user)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<IdentityUser>> GetAllUsersAsync()
    {
        throw new NotImplementedException();
    }

    public Task<IdentityUser> GetUserByEmailAsync(string email)
    {
        throw new NotImplementedException();
    }

    public Task<IdentityUser> GetUserByIdAsync(int id)
    {
        throw new NotImplementedException();
    }

    public Task<IdentityUser> UpdateUserAsync(IdentityUser user)
    {
        throw new NotImplementedException();
    }
}
