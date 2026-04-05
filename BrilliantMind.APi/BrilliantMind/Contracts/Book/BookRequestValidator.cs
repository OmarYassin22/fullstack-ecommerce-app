using FluentValidation;

namespace BrilliantMind.Contracts.Book;

public class BookRequestValidator : AbstractValidator<BookRequest>
{
    public BookRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Title cannot be empty.");
        RuleFor(x => x.Description).NotEmpty().WithMessage("Description cannot be empty.");
        RuleFor(x => x.Price).GreaterThan(0).WithMessage("Price must be greater than 0.");
        RuleFor(x => x.StartAge).GreaterThanOrEqualTo(0).WithMessage("Start age must be greater than or equal to 0.");
        RuleFor(x => x.EndAge).GreaterThanOrEqualTo(0).WithMessage("End age must be greater than or equal to 0.");
        RuleFor(x => x.Discount).GreaterThanOrEqualTo(0).When(x => x.Discount.HasValue)
            .WithMessage("Discount must be greater than or equal to 0.");
        RuleFor(x => x.PagesNumber).GreaterThan(1).WithMessage("Pages number must be greater than 1.");
        RuleFor(x => x.CategoryName).NotEmpty().WithMessage("Category name cannot be empty.");
    }
}
