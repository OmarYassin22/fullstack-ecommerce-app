using BrilliantMind.Contracts.Book;
using BrilliantMind.Contracts.Order;
using BrilliantMind.Contracts.User;
using BrilliantMind.Data;
using BrilliantMind.Data.Model;
using BrilliantMind.Interfaces;
using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BrilliantMind.Repo;

public class OrderRepo(ApPDbContext context, IImageService imageService, UserManager<IdentityUser> userManager) : IOrderRepo
{
    private readonly ApPDbContext _context = context;
    private readonly IImageService _imageService = imageService;
    private readonly UserManager<IdentityUser> _userManager = userManager;

    public async Task<OrderResponse2?> CreateOrderAsync(IdentityUser user, OrderRequest order)
    {
        if (user is null || order is null)
            return null; // User or order request cannot be null
        if (order.BookIds is null || order.BookIds.Count() == 0)
            return null; // No book IDs provided in the order request


        var dbOrder = new Order
        {
            // Set properties from order request manually
            Address = order.Address,
            PhoneNumber = order.PhoneNumber,
            Email = order.Email,
            Notes = order.Notes,
            Status = OrderStatus.Pending,
            UserId = user.Id,
            User = user,
            CreatedBy = user,
            CreatedDate = DateTime.UtcNow,
            Active = true
        };
        var orderBooks = await _context.Books.Where(b => order.BookIds.Contains(b.Id)).ToListAsync();



        foreach (var book in orderBooks)
        {

            if (book.Users is not null && book.Users.Any(b => b.UserId == user.Id))
                return null;
        }

        if (orderBooks is null || orderBooks.Count == 0)
        {
            return null; // No books found for the provided IDs
        }
        dbOrder.Books = orderBooks;

        dbOrder.TotalPrice = orderBooks.Sum(b => b.FinalPrice ?? b.Price);

        _context.Orders.Add(dbOrder);
        var result = await _context.SaveChangesAsync();

        if (result > 0)
        {
            var r = new OrderResponse2(
                dbOrder.Id,
                dbOrder.Active,
                dbOrder.UserId,
                dbOrder.User.Adapt<UserResponse>(),
                dbOrder.Books.Select(b => b.Title),
                dbOrder.TotalPrice ?? 0,
                dbOrder.Status.ToString(),
                dbOrder.Address,
                dbOrder.PhoneNumber,
                dbOrder.Email,
                dbOrder.Notes,
                dbOrder.TransactionId

                );
            return r;
        }

        return null;
    }

    public async Task<bool> UserHaveBooksAsync(IdentityUser user, List<int> bookid)
    {
        var orderBooks = await _context.Books.Where(b => bookid.Contains(b.Id)).ToListAsync();

        var userExistingOrderd = await _context.UserBooks
    .Where(o => o.UserId == user.Id && orderBooks.Contains(o.Book)).AnyAsync();
        if (userExistingOrderd)
            return false; // User already has an order with these books
        return true; // User does not have an order with these books

    }
    public async Task<bool> DeleteOrderAsync(int id, IdentityUser user)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null)
            return false;
        var userRoles = await _userManager.GetRolesAsync(user);
        if (order.UserId != user.Id && !userRoles.Contains("Admin"))
            return false; // User is not authorized to delete this order
        _context.Orders.Remove(order);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }



    public async Task<IEnumerable<OrderResponse>> GetAllOrdersAsync()
    {

        var orders = await _context.Orders
         .Include(o => o.User)
         .Include(o => o.Books)
             .ThenInclude(b => b.Category)
         .Include(o => o.Books)
             .ThenInclude(b => b.ImageUrls)
         .ToListAsync();

        var result = orders.Select(o => new OrderResponse(
            o.Id,
            o.Active,
            o.UserId,
            o.User.Adapt<UserResponse>(),
            o.Books.Adapt<IEnumerable<BookResponse>>(),
            o.TotalPrice ?? 0,
            o.Status.ToString(),
            o.Address,
            o.PhoneNumber,
            o.Email,
            o.Notes,
            o.TransactionId
        )).ToList();




        return result;
    }

    public async Task<OrderResponse?> GetOrderByIdAsync(int id, IdentityUser user)
    {
        var o = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.Books)
            .ThenInclude(b => b.Category)
            .Include(b => b.Books)
            .ThenInclude(b => b.ImageUrls)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (o == null)
            return null;
        if (o.User != user)
            return null;



        var result = new OrderResponse(
                  o.Id,
                  o.Active,
                  o.UserId,
                  o.User.Adapt<UserResponse>(),
                  o.Books.Select(b => new BookResponse(
                b.Id, b.Title, b.CategoryId,
                b.Category.Title,
                b.Description,
                b.Price,
                b.Discount,
                b.PagesNumber
                , b.ImageUrls.Select(img => _imageService.GetFileUrl(img.ImageUrl)),
                _imageService.GetFileUrl(b.PdfPath)



                )),
                  o.TotalPrice ?? 0,
                  o.Status.ToString(),
                  o.Address,
                  o.PhoneNumber,
                  o.Email,
                  o.Notes,
                  o.TransactionId
              );
        return result;
    }

    public async Task<IEnumerable<OrderResponse>> GetOrdersByUserIdAsync(string userId)
    {
        var orders = _context.Orders.Where(o => o.UserId == userId)
            .Include(o => o.User)
            .Include(o => o.Books)
            .ThenInclude(b => b.Category)
            .Include(o => o.Books)
            .ThenInclude(b => b.ImageUrls);
        var result = await orders.Select(o => new OrderResponse(
    o.Id,
    o.Active,
    o.UserId,
    o.User.Adapt<UserResponse>(),
    o.Books.Select(b => new BookResponse(
                b.Id, b.Title, b.CategoryId,
                b.Category.Title,
                b.Description,
                b.Price,
                b.Discount,
                b.PagesNumber
                , b.ImageUrls.Select(img => _imageService.GetFileUrl(img.ImageUrl)),
                _imageService.GetFileUrl(b.PdfPath)



                )),
    o.TotalPrice ?? 0,
    o.Status.ToString(),
    o.Address,
    o.PhoneNumber,
    o.Email,
    o.Notes,
    o.TransactionId
)).ToListAsync();

        return result;
    }

    public async Task<bool> UpdateOrderAsync(int id, OrderRequest order, IdentityUser user)
    {
        var dbOrder = await _context.Orders.Include(b => b.Books).FirstOrDefaultAsync(o => o.Id == id);
        var dbBooks = await _context.Books.Where(b => order.BookIds.Contains(b.Id)).ToListAsync();
        if (dbOrder == null)
            return false; // Order not found
        if (dbOrder.UserId != user.Id)
            return false; // User is not authorized to update this order
                          // remove the books that are not in the order request
        dbOrder.Books.Clear();
        foreach (var bookid in order.BookIds)
        {
            var dbbook = await _context.Books.FindAsync(bookid);
            if (dbbook is not null)
                dbOrder.Books.Add(dbbook);

        }
        dbOrder.TotalPrice = 0;
        dbBooks.ForEach(b => dbOrder.TotalPrice += b.FinalPrice.HasValue ? b.FinalPrice.Value : b.Price);
        dbOrder.Address = order.Address;
        dbOrder.PhoneNumber = order.PhoneNumber;
        dbOrder.Email = order.Email;
        dbOrder.Notes = order.Notes;
        dbOrder.TransactionId = order.TransactionId;

        // Fix for CS0029: Convert the string to the OrderStatus enum
        if (Enum.TryParse(order.Status, out OrderStatus parsedStatus))
        {
            dbOrder.Status = parsedStatus;
        }
        //else
        //{
        //    return false; // Invalid status value
        //}

        //dbOrder.UpdatedBy = user; // Set UpdatedBy to the current user
        dbOrder.UpdatedDate = DateTime.UtcNow; // Set the updated date
        _context.Orders.Update(dbOrder);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }


}
