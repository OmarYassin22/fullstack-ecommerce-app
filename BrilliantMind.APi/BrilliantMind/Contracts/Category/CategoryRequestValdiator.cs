using FluentValidation;

namespace BrilliantMind.Contracts.Category;

public class CategoryRequestValidator : AbstractValidator<CategoryRequest>
{
    public CategoryRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Title cannot be empty.");
        RuleFor(x => x.Description).NotEmpty().WithMessage("Description cannot be empty.");
    }
}