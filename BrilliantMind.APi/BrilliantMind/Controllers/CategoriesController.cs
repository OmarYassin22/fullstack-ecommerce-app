using BrilliantMind.Contracts.Category;
using BrilliantMind.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BrilliantMind.Controllers;
[Route("api/[controller]")]
[ApiController]
public class CategoriesController(ICategoryRepo repo) : ControllerBase
{
    private readonly ICategoryRepo _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAllCategories()
    {
        var categories = await _repo.GetAllCategoriesAsync();
        if (categories is null || !categories.Any())
        {
            return NotFound("No categories found.");
        }
        return Ok(categories);

    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategoryById(int id)
    {
        var category = await _repo.GetCategoryByIdAsync(id);
        if (category is null)
        {
            return NotFound($"Category with id {id} not found.");
        }
        return Ok(category);
    }
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddCategory([FromBody] CategoryRequest category)
    {
        if (category is null)
        {
            return BadRequest("Category cannot be null.");
        }
        var addedCategory = await _repo.AddCategoryAsync(category);
        if (addedCategory is null)
        {
            return Conflict("Category with the same title already exists.");
        }
        return CreatedAtAction(nameof(GetCategoryById), new { id = addedCategory.Id }, addedCategory);
    }
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]

    public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryRequest category)
    {
        if (category is null)
        {
            return BadRequest("Category cannot be null.");
        }
        var updatedCategory = await _repo.UpdateCategoryAsync(id, category);
        if (updatedCategory is null)
        {
            return NotFound($"Category with id {id} not found.");
        }
        return Ok(updatedCategory);
    }
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]

    public async Task<IActionResult> DeleteCategory(int id)
    {
        var isDeleted = await _repo.DeleteCategoryAsync(id);
        if (!isDeleted)
        {
            return NotFound($"Category with id {id} not found.");
        }
        return NoContent();
    }
    [HttpDelete]
    [Authorize(Roles = "Admin")]

    public async Task<IActionResult> DeleteCategory([FromBody] CategoryRequest category)
    {
        if (category is null)
        {
            return BadRequest("Category cannot be null.");
        }
        var isDeleted = await _repo.DeleteCategoryAsync(category);
        if (!isDeleted)
        {
            return NotFound($"Category with title {category.Title} not found.");
        }
        return NoContent();
    }

}
