using FluentValidation;

namespace BrilliantMind.Contracts.Order;

public class OrderRequestValidator : AbstractValidator<OrderRequest>
{
    public OrderRequestValidator()
    {
        //RuleFor(order => order.UserId).NotEmpty().WithMessage("User ID cannot be empty.");
        RuleFor(order => order.BookIds).NotEmpty().WithMessage("Order must contain at least one book.");
        RuleFor(order => order.Email).NotEmpty().WithMessage("Email cannot be empty.")
            .EmailAddress().WithMessage("Invalid email format.");


    }

}
