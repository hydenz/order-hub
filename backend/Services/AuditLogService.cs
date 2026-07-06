using Microsoft.EntityFrameworkCore;
using order_hub.Data;

namespace order_hub.Services;

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _db;

    public AuditLogService(AppDbContext db) => _db = db;

    public async Task<object> GetAllAsync(int page, int pageSize)
    {
        var query = _db.AuditLogs.AsQueryable();
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.ChangedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new { items, total, page, pageSize };
    }
}
