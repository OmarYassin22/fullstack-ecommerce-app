using BrilliantMind.Contracts.Category;

namespace BrilliantMind.Interfaces;

public interface ICategoryRepo
{
    Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync();
    Task<CategoryResponse> GetCategoryByIdAsync(int id);
    Task<CategoryResponse> AddCategoryAsync(CategoryRequest category);
    Task<CategoryResponse> UpdateCategoryAsync(int id, CategoryRequest category);
    Task<bool> DeleteCategoryAsync(int id);
    Task<bool> DeleteCategoryAsync(CategoryRequest category);
}
