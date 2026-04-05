using FluentValidation;

namespace BrilliantMind.Contracts.User;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().WithMessage("Email cannot be empty.")
            .EmailAddress().WithMessage("Invalid email format.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Password cannot be empty.")
            .MinimumLength(6).WithMessage("Password must be at least 8 characters long with special characters, lowercase and uppercase");
        RuleFor(x => x.UserName).NotEmpty().WithMessage("User name cannot be empty.")
            .MinimumLength(3).WithMessage("User name must be at least 3 characters long.");
    }
}