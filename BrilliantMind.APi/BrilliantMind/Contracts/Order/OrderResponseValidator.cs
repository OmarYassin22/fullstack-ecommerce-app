using FluentValidation;

namespace BrilliantMind.Contracts.Order;

public class OrderResponseValidator : AbstractValidator<OrderResponse>
{
    public OrderResponseValidator()
    {
        RuleFor(order => order.Id).GreaterThan(0).WithMessage("Order ID must be greater than 0.");
        RuleFor(order => order.UserId).NotEmpty().WithMessage("User ID cannot be empty.");
        RuleFor(order => order.TotalPrice).GreaterThanOrEqualTo(0).WithMessage("Total price must be non-negative.");
        RuleFor(order => order.Status).NotEmpty().WithMessage("Status cannot be empty.");
        RuleFor(order => order.Books).NotEmpty().WithMessage("Order must contain at least one book.");

        // Additional rules can be added as needed

    }
}
