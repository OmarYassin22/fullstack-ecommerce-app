using BeetElward.Contracts.Book;
using Microsoft.AspNetCore.Identity;

namespace BeetElward.Interfaces;

public interface IBookRepo
{
    Task<IEnumerable<BookResponse>> GetAllBooksAsync(bool isAdmin);
    Task<BookResponse> GetBookByIdAsync(int id);
    Task<IEnumerable<BookResponse>> GetBooksByUserAsync(IdentityUser user);
    Task<IEnumerable<BookResponse>> GetBooksByCategoryIdAsync(int categoryId);
    //Task<IEnumerable<BookResponse>> GetBooksByAgeRangeAsync(int startAge, int endAge);
    Task<IEnumerable<BookResponse>> GetBooksByTitleAsync(string title);
    Task<BookResponse?> AddBookAsync(BookRequest book);
    Task<BookResponse> UpdateBookAsync(int id, BookRequest book);
    Task<bool> DeleteBookAsync(int id);
    Task<bool> DeleteBookFromUser(IdentityUser user, int bookId);
    Task<byte[]?> GetBookPdf(IdentityUser user, int bookId);


}
