using System.Security.Claims;
using BeetElward.Contracts.Book;
using BeetElward.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BeetElward.Controllers;
[Route("api/[controller]")]
[ApiController]
public class BooksController(IBookRepo repo, UserManager<IdentityUser> userManager) : ControllerBase
{
    private readonly IBookRepo _repo = repo;
    private readonly UserManager<IdentityUser> _userManager = userManager;

    [HttpGet("GetAllBooks")]
    public async Task<IActionResult> GetAllBooks()
    {
     
        var books = await _repo.GetAllBooksAsync(false);
        return Ok(books);
    }
    [HttpGet("AdminGetAllBooks")]
    [Authorize(Roles ="Admin")]
    public async Task<IActionResult> GetAllBooks2()
    {
       
        var books = await _repo.GetAllBooksAsync(true);
        return Ok(books);
    }

    [HttpGet("GetBookById/{id}")]
    public async Task<IActionResult> GetBook(int id)
    {
        var book = await _repo.GetBookByIdAsync(id);
        if (book is null)
        {
            return NotFound($"Book with id {id} not found.");
        }
        return Ok(book);
    }
    [HttpGet("GetBooksByUser")]
    [Authorize]
    public async Task<IActionResult> GetBooksByUser()
    {
        var r = User.FindFirst(ClaimTypes.Email);
        var user = await _userManager.FindByEmailAsync(User.FindFirst(ClaimTypes.Email).Value);
      
        var books = await _repo.GetBooksByUserAsync(user);
        return Ok(books);
    }
    [HttpGet("GetBooksByCategoryId/{categoryId}")]
    public async Task<IActionResult> GetBooksByCategoryId(int categoryId)
    {
        var books = await _repo.GetBooksByCategoryIdAsync(categoryId);
        if (books is null || !books.Any())
        {
            return NotFound($"No books found for category id {categoryId}.");
        }
        return Ok(books);
    }
    //[HttpGet("GetBooksByAgeRange")]
    //public async Task<ActionResult> GetBookById([FromQuery] int startAge, [FromQuery] int endAge)
    //{
    //    var books = await _repo.GetBooksByAgeRangeAsync(startAge, startAge);
    //    if (books is null || !books.Any())
    //    {
    //        return NotFound($"No books found for age range {startAge}-{startAge}.");
    //    }
    //    return Ok(books);
    //}

    [HttpPost("AddBook")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddBook([FromForm] BookRequest book)
    {
        if (book is null)
        {
            return BadRequest("Book data is required.");
        }
        var addedBook = await _repo.AddBookAsync(book);
        if (addedBook is null)
        {
            return BadRequest("Failed to add the book. Please try again.");
        }
        return CreatedAtAction(nameof(GetBook), new { id = addedBook.Id }, addedBook);
    }

    [HttpDelete("DeleteUserBook/{id:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteUserBook([FromRoute] int id)
    {
        var userEmail = User?.FindFirstValue(ClaimTypes.Email);
        if (id <= 0)
        {
            return BadRequest("Invalid book id provided.");
        }
        var user = await _userManager.FindByEmailAsync(userEmail);
        if (user is null)
        {
            return Unauthorized("User is not authenticated.");
        }
        var isDeleted = await _repo.DeleteBookFromUser(user, id);
        if (!isDeleted)
        {
            return NotFound($"Book with id {id} not found.");
        }
        return NoContent();
    }
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]

    public async Task<IActionResult> UpdateBook([FromRoute] int id, [FromForm] BookRequest book)
    {
        if (book is null || id <= 0)
        {
            return BadRequest("Invalid book data provided.");
        }
        var updatedBook = await _repo.UpdateBookAsync(id, book);
        if (updatedBook is null)
        {
            return NotFound($"Book with id {id} not found.");
        }
        return Ok(updatedBook);
    }
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBook([FromRoute] int id)
    {
        if (id <= 0)
        {
            return BadRequest("Invalid book id provided.");
        }
        var isDeleted = await _repo.DeleteBookAsync(id);
        if (!isDeleted)
        {
            return NotFound($"Book with id {id} not found.");
        }
        return NoContent();
    }

    [HttpGet("GetBookPdf/{bookId:int}")]
    [Authorize]
    public async Task<IActionResult> GetBookPdf([FromRoute] int bookId)
    {


        var user = await _userManager.FindByEmailAsync(User?.FindFirstValue(ClaimTypes.Email));
        if (user is null)
        {
            return Unauthorized("User is not authenticated.");
        }
        var pdfData = await _repo.GetBookPdf(user, bookId);
        if (pdfData is null || pdfData.Length == 0)
        {
            return NotFound($"PDF for book with id {bookId} not found.");
        }
        return File(pdfData, "application/pdf", $"book_{bookId}.pdf");
    }
}
