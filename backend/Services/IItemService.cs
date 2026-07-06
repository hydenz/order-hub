using order_hub.Models;

namespace order_hub.Services;

public interface IItemService
{
    Task<List<Item>> GetAllAsync();
    Task<Item?> GetByIdAsync(int id);
    Task<Item> CreateAsync(Item item);
    Task<Item?> UpdateAsync(int id, Item item);
    Task<(bool Success, string? Error)> DeleteAsync(int id);
}
