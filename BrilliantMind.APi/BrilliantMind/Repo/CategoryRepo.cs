using BrilliantMind.Contracts.Category;
using BrilliantMind.Data;
using BrilliantMind.Data.Model;
using BrilliantMind.Interfaces;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace BrilliantMind.Repo;

public class CategoryRepo(ApPDbContext context) : ICategoryRepo
{
    private readonly ApPDbContext _context = context;

    public async Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync()
    {
        List<Category>? t = await _context.Categories.Include(c => c.Books).ToListAsync();
        var result = await _context.Categories.Include(c => c.Books).
            Select(c => new CategoryResponse(c.Id, c.Title, c.Description,
            c.Books.Select(b => b.Title).ToList()
            )).ToListAsync();
        return result;
    }

    public async Task<CategoryResponse?> GetCategoryByIdAsync(int id)
    {

        var result = await _context.Categories.Include(c => c.Books).FirstOrDefaultAsync(c => c.Id == id);
        if (result is null) return null;
        var r = new CategoryResponse(
            result.Id,
            result.Title
            , result.Description
            , result.Books.Select(b => b.Title));
        return r;
    }

    public async Task<CategoryResponse?> UpdateCategoryAsync(int Id, CategoryRequest category)
    {
        if (category is null) throw new ArgumentNullException(nameof(category), "Category cannot be null.");
        var existingCategory = await _context.Categories.FirstOrDefaultAsync(c => c.Id == Id);
        if (existingCategory is null) return null;
        existingCategory.Title = category.Title;
        existingCategory.Description = category.Description;

        _context.Categories.Update(existingCategory);
        await _context.SaveChangesAsync();
        return existingCategory.Adapt<CategoryResponse>();


    }
    public async Task<CategoryResponse?> AddCategoryAsync(CategoryRequest category)
    {
        if (category is null) return null;
        var existingCategory = _context.Categories.FirstOrDefault(c => c.Title == category.Title);
        if (existingCategory is not null) return null;
        var newCategory = category.Adapt<Category>();
        _context.Categories.Add(newCategory);
        await _context.SaveChangesAsync();
        return newCategory.Adapt<CategoryResponse>();
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null) return false;
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteCategoryAsync(CategoryRequest category)
    {

        var existingCategory = await _context.Categories.Where(c => c.Title == category.Title).FirstOrDefaultAsync();
        if (existingCategory is null) return false;
        _context.Categories.Remove(existingCategory);
        await _context.SaveChangesAsync();
        return true;
    }


}
