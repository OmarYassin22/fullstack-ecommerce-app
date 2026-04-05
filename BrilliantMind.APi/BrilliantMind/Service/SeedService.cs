using Microsoft.AspNetCore.Identity;

namespace BrilliantMind.Services;

public static class SeedService
{
    public static async Task SeedAdminUserAsync(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        // Create Admin role if it doesn't exist
        const string adminRole = "Admin";
        if (!await roleManager.RoleExistsAsync(adminRole))
        {
            await roleManager.CreateAsync(new IdentityRole(adminRole));
        }

        // Create User role if it doesn't exist (for your existing registration)
        const string userRole = "User";
        if (!await roleManager.RoleExistsAsync(userRole))
        {
            await roleManager.CreateAsync(new IdentityRole(userRole));
        }

        // Check if admin user already exists
        const string adminEmail = "************************";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            var admin = new IdentityUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(admin, "***************************");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, adminRole);
            }
        }
    }
}