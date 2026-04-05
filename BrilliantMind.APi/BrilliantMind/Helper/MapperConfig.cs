using BrilliantMind.Contracts.Book;
using BrilliantMind.Contracts.Order;
using BrilliantMind.Data.Model;
using Mapster;

namespace BrilliantMind.Helper;

public class MapperConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // BookRequest to Book mapping
        config.NewConfig<BookRequest, Book>()
            .Map(dest => dest.Title, src => src.Title)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Price, src => src.Price)
              .Map(dest => dest.PagesNumber, src => src.PagesNumber)
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CategoryId) // Will be set manually
            .Ignore(dest => dest.Category)
            .Ignore(dest => dest.Discount)
            .Ignore(dest => dest.FinalPrice);

        // Book to BookResponse mapping
        config.NewConfig<Book, BookResponse>()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Title, src => src.Title)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Price, src => src.Price)
             .Map(dest => dest.PagesNumber, src => src.PagesNumber)
            .Map(dest => dest.ImageUrls, src => src.ImageUrls != null ? src.ImageUrls.Where(img => img != null).Select(img => img.ImageUrl) : new List<string>())
            .Map(dest => dest.Category, src => src.Category.Title)
            .Map(dest => dest.Discount, src => src.Discount);

        config.NewConfig<Order, OrderResponse>()
            .Map(dest => dest.Status, src => src.Status);

    }
}
