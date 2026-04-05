using FluentValidation;

namespace BrilliantMind.Contracts.Category;

public class CategoryResponseValidator : AbstractValidator<CategoryResponse>
{
    public CategoryResponseValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Id must be greater than 0.");
        RuleFor(x => x.Title).NotEmpty().WithMessage("Title cannot be empty.");
        RuleFor(x => x.Description).NotEmpty().WithMessage("Description cannot be empty.");
    }
}