using Microsoft.EntityFrameworkCore;
using order_hub.Data;
using order_hub.Models;

namespace order_hub.Services;

public class TransportTypeService : ITransportTypeService
{
    private readonly AppDbContext _db;

    public TransportTypeService(AppDbContext db) => _db = db;

    public async Task<List<TransportType>> GetAllAsync()
        => await _db.TransportTypes.OrderByDescending(t => t.CreatedAt).ToListAsync();

    public async Task<TransportType?> GetByIdAsync(int id)
        => await _db.TransportTypes.FindAsync(id);

    public async Task<TransportType> CreateAsync(TransportType transportType)
    {
        transportType.CreatedAt = DateTime.UtcNow;
        _db.TransportTypes.Add(transportType);
        await _db.SaveChangesAsync();
        return transportType;
    }

    public async Task<TransportType?> UpdateAsync(int id, TransportType updated)
    {
        var t = await _db.TransportTypes.FindAsync(id);
        if (t == null) return null;

        t.Name = updated.Name;
        t.Description = updated.Description;
        await _db.SaveChangesAsync();
        return t;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var t = await _db.TransportTypes.FindAsync(id);
        if (t == null) return false;

        _db.TransportTypes.Remove(t);
        await _db.SaveChangesAsync();
        return true;
    }
}
