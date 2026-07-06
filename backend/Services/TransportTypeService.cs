using Microsoft.EntityFrameworkCore;
using order_hub.Data;
using order_hub.Models;

namespace order_hub.Services;

public class TransportTypeService : ITransportTypeService
{
    private readonly AppDbContext _db;
    private readonly IAuditService _audit;

    public TransportTypeService(AppDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<List<TransportType>> GetAllAsync()
        => await _db.TransportTypes.OrderByDescending(t => t.CreatedAt).ToListAsync();

    public async Task<TransportType?> GetByIdAsync(int id)
        => await _db.TransportTypes.FindAsync(id);

    public async Task<TransportType> CreateAsync(TransportType transportType)
    {
        transportType.CreatedAt = DateTime.UtcNow;
        _db.TransportTypes.Add(transportType);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("TransportType", transportType.Id, "Created", null, transportType);
        return transportType;
    }

    public async Task<TransportType?> UpdateAsync(int id, TransportType updated)
    {
        var t = await _db.TransportTypes.FindAsync(id);
        if (t == null) return null;

        var old = new { t.Name, t.Description };
        t.Name = updated.Name;
        t.Description = updated.Description;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("TransportType", id, "Updated", old, new { updated.Name, updated.Description });
        return t;
    }

    public async Task<(bool Success, string? Error)> DeleteAsync(int id)
    {
        var t = await _db.TransportTypes.FindAsync(id);
        if (t == null) return (false, null);

        var inUse = await _db.Orders.AnyAsync(o => o.TransportTypeId == id);
        if (inUse) return (false, "Tipo de transporte está vinculado a pedidos e não pode ser excluído.");

        _db.TransportTypes.Remove(t);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("TransportType", id, "Deleted", t, null);
        return (true, null);
    }
}
