using Microsoft.EntityFrameworkCore;
using order_hub.Data;
using order_hub.Models;

namespace order_hub.Services;

public class ItemService : IItemService
{
    private readonly AppDbContext _db;
    private readonly IAuditService _audit;

    public ItemService(AppDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<List<Item>> GetAllAsync()
        => await _db.Items.OrderByDescending(i => i.CreatedAt).ToListAsync();

    public async Task<Item?> GetByIdAsync(int id)
        => await _db.Items.FindAsync(id);

    public async Task<Item> CreateAsync(Item item)
    {
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        _db.Items.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Item", item.Id, "Created", null, item);
        return item;
    }

    public async Task<Item?> UpdateAsync(int id, Item updated)
    {
        var item = await _db.Items.FindAsync(id);
        if (item == null) return null;

        var old = new { item.Name, item.Description, item.Price, item.StockQuantity };

        item.Name = updated.Name;
        item.Description = updated.Description;
        item.Price = updated.Price;
        item.StockQuantity = updated.StockQuantity;
        item.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("Item", id, "Updated", old, new { updated.Name, updated.Description, updated.Price, updated.StockQuantity });
        return item;
    }

    public async Task<(bool Success, string? Error)> DeleteAsync(int id)
    {
        var item = await _db.Items.FindAsync(id);
        if (item == null) return (false, null);

        var inUse = await _db.OrderItems.AnyAsync(oi => oi.ItemId == id);
        if (inUse) return (false, "Item está vinculado a pedidos e não pode ser excluído.");

        _db.Items.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Item", id, "Deleted", item, null);
        return (true, null);
    }
}
