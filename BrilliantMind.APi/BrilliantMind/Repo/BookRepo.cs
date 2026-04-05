using BeetElward.Contracts.Book;
using BeetElward.Data;
using BeetElward.Data.Model;
using BeetElward.Interfaces;
using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BeetElward.Repo;

public class BookRepo(ApPDbContext context, IImageService imageService, IWebHostEnvironment environment)
    : IBookRepo
{
    private readonly ApPDbContext _context = context;
    private readonly IImageService _imageService = imageService;
    private readonly IWebHostEnvironment _environment = environment;

    public async Task<IEnumerable<BookResponse>> GetAllBooksAsync(bool isAdmin)
    {

         var books = _context.Books.Include(b => b.ImageUrls);
        if (isAdmin)
        {
            var result = books.Select(b =>
            new BookResponseWithSellCount(b.Id,
              b.Title,
        b.CategoryId,
        b.Category.Title,
        b.Description,
        b.Price,
        b.Discount,
          b.PagesNumber,

        b.ImageUrls.Select(img => _imageService.GetFileUrl(img.ImageUrl)),
       _imageService.GetFileUrl(b.PdfPath),
         _context.UserBooks.Count(ub => ub.BookId == b.Id),

         b.Price * _context.UserBooks.Count(ub => ub.BookId == b.Id)

            ));
            return result;
        }
        else
        {
            var result = books.Select(b =>
        new BookResponse(b.Id,
        b.Title,
        b.CategoryId,
        b.Category.Title,
        b.Description,
        b.Price,
        b.Discount,
          b.PagesNumber,

        b.ImageUrls.Select(img => _imageService.GetFileUrl(img.ImageUrl)),
       null// _imageService.GetFileUrl(b.PdfPath)
           )

        );
        return result;
        }

    }
    public async Task<BookResponse?> GetBookByIdAsync(int id)
    {
        var b = await _context.Books.Include(b => b.ImageUrls).Include(b => b.Category).Where(b => b.Id == id).FirstOrDefaultAsync();
        if (b is null)
            return null;
        var result =
       new BookResponse(b.Id, b.Title, b.CategoryId, b?.Category?.Title, b.Description, b.Price, b.Discount, b.PagesNumber,

       b.ImageUrls.Select(img => _imageService.GetFileUrl(img.ImageUrl)),
       null//_imageService.GetFileUrl(b.PdfPath)
           );

        return result;
    }

    public async Task<IEnumerable<BookResponse>> GetBooksByUserAsync(IdentityUser user)
    {
        var books = await _context.Books.Include(b => b.ImageUrls).Include(b => b.Category)
            .Where(b => b.Users.Any(ub => ub.User == user)).ToListAsync()
           ;
        return books.Select(b => new BookResponse(
                b.Id, b.Title, b.CategoryId,
                b.Category.Title,
                b.Description,
                b.Price,
                b.Discount,
                b.PagesNumber
                , b.ImageUrls.Select(img => _imageService.GetFileUrl(img.ImageUrl)),
                _imageService.GetFileUrl(b.PdfPath)



                ));
    }


    //public async Task<IEnumerable<BookResponse>> GetBooksByAgeRangeAsync(int startAge, int endAge)
    //{
    //    var r = await _context.Books.Where(b => b.StartAge >= startAge && b.EndAge <= endAge).ToListAsync();
    //    return r.Adapt<IEnumerable<BookResponse>>();
    //}

    public async Task<IEnumerable<BookResponse>> GetBooksByCategoryIdAsync(int categoryId)
    {
        var r = await _context.Books.Where(b => b.CategoryId == categoryId).ToListAsync();
        return r.Adapt<IEnumerable<BookResponse>>();
    }

    public async Task<IEnumerable<BookResponse>> GetBooksByTitleAsync(string title)
    {
        var r = await _context.Books.Where(b => b.Category.Title.ToLower().Equals(title)).ToListAsync();
        return r.Adapt<IEnumerable<BookResponse>>();
    }

    public async Task<BookResponse> UpdateBookAsync(int id, BookRequest book)
    {
        // Implement the logic to update a book's details
        var existingBook = await _context.Books.Include(b => b.ImageUrls).Include(b => b.Category).Where(b => b.Id == id).FirstOrDefaultAsync();
        if (existingBook is null)
        {
            return null;
        }
        if (!string.IsNullOrEmpty(book.CategoryName))
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Title.Trim().ToLower() == book.CategoryName.Trim().ToLower());
            if (category != null)
            {
                existingBook.Category = category;
                existingBook.CategoryId = category.Id;
            }
        }

        existingBook.Title = book.Title;
        existingBook.Description = book.Description;
        existingBook.Price = book.Price;
        existingBook.PagesNumber = book.PagesNumber;
        existingBook.Discount = book.Discount;

        // Update images if provided
        if (book.Images is not null && book.Images.Any())
        {
            // Clear existing images
            foreach (var imageUrl in existingBook.ImageUrls)
            {
                var res = await _imageService.DeleteImageAsync(imageUrl.ImageUrl);

            }
            existingBook.ImageUrls.Clear();

            foreach (var img in book.Images)
            {
                var url = await _imageService.SaveImageAsync(img, existingBook.Id.ToString());
                existingBook.ImageUrls.Add(new BookImages { ImageUrl = url });

            }

        }
        // Update PDF if provided
        if (book.Pdf is not null)
        {
            var res = await _imageService.DeleteImageAsync(existingBook.PdfPath);
            var url = await _imageService.SaveImageAsync(book.Pdf, existingBook.Id.ToString());

            existingBook.PdfPath = url;
        }
        _context.Books.Update(existingBook);
        var result = await _context.SaveChangesAsync();


        return existingBook.Adapt<BookResponse>();
    }

    public async Task<BookResponse?> AddBookAsync(BookRequest book)
    {    // First, find the category by name
        try
        {
            var category = await _context.Categories
                       .FirstOrDefaultAsync(c => c.Title.Trim().ToLower() == book.CategoryName.Trim().ToLower());

            if (category == null)
            {
                throw new ArgumentException($"Category '{book.CategoryName}' not found");
            }

            var newBook = new Book
            {
                Category = category, // Set the category object directly
                Title = book.Title,
                Description = book.Description,
                Price = book.Price,
                PagesNumber = book.PagesNumber,
                Discount = book.Discount,
                ImageUrls = new List<BookImages?>()

            };
            newBook.CategoryId = category.Id;

            foreach (var image in book?.Images)
            {
                if (image is null)
                {
                    throw new ArgumentNullException(nameof(image), "Image cannot be null");
                }

                var imageUrl = await _imageService.SaveImageAsync(image, Guid.NewGuid().ToString());
                if (imageUrl is null)
                {
                    throw new InvalidOperationException("Failed to save image");
                }
                newBook.ImageUrls.Add(new BookImages { ImageUrl = imageUrl });
            }

            if (book?.Pdf is not null)
            {
                var pdfPath = await _imageService.SaveImageAsync(book.Pdf, newBook.Id.ToString());
                if (pdfPath is null)
                {
                    throw new InvalidOperationException("Failed to save PDF file");
                }
                newBook.PdfPath = pdfPath;
            }

            _context.Books.Add(newBook);
            var result = await _context.SaveChangesAsync();
            if (result > 0)
            {
                return new BookResponse(newBook.Id, newBook.Title, newBook.CategoryId, newBook.Category.Title, newBook.Description, newBook.Price, newBook.Discount, newBook.PagesNumber,

  newBook.ImageUrls.Select(img => _imageService.GetFileUrl(img.ImageUrl)), _imageService.GetFileUrl(newBook.PdfPath));

            }
            return null; // Or handle the failure case as needed

        }
        catch (Exception)
        {

            return null;
        }

    }

    public async Task<bool> DeleteBookAsync(int id)
    {
        // Implement the logic to delete a book by its ID
        var book = await _context.Books.FindAsync(id);
        if (book is null)
        {
            return false;
        }
        if (book.PdfPath is not null) _imageService.DeleteImageAsync(book.PdfPath);
        if (book.ImageUrls is not null && book.ImageUrls.Any())
        {
            // Delete all images  with the book
            foreach (var image in book.ImageUrls)
            {
                _imageService.DeleteImageAsync(image.ImageUrl);
            }
        }

        _context.Books.Remove(book);
        var r = await _context.SaveChangesAsync();
        if (r > 0)
            return true;
        return false;

    }

    public async Task<bool> DeleteBookFromUser(IdentityUser user, int bookId)
    {
        var userBook = await _context.UserBooks.FirstOrDefaultAsync(ub => ub.User == user && ub.BookId == bookId);
        if (userBook is null)
        {
            return false; // Book not found for the user
        }
        _context.UserBooks.Remove(userBook);
        var result = await _context.SaveChangesAsync();
        return result > 0; // Return true if the deletion was successful
    }
    public async Task<byte[]?> GetBookPdf(IdentityUser user, int bookId)
    {
        var book = _context.UserBooks.Include(b => b.Book).Where(b => b.BookId == bookId && b.User == user);
        if (book is null || !book.Any())
        {
            return null;
        }
        //var bookPdf = await _context.Books.Where(b => b.Id == bookId).Select(b => b.PdfPath).FirstOrDefaultAsync();
        //if (string.IsNullOrEmpty(bookPdf))
        //{
        //    return null;
        //}
        var bookEntity = await _context.Books.FindAsync(bookId);
        if (bookEntity?.PdfPath == null)
            return null;

        var filePath = Path.Combine(_environment.WebRootPath, "pdfs", bookEntity.PdfPath);
        if (!System.IO.File.Exists(filePath))
            return null;

        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return fileBytes;


    }

}
