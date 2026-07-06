using order_hub.Data;
using order_hub.Models;

namespace order_hub.Services;

public class AuditService : IAuditService
{
    private readonly AppDbContext _db;

    public AuditService(AppDbContext db) => _db = db;

    public async Task LogAsync(string entityType, int entityId, string action, object? oldValues, object? newValues, string? changedBy = "system")
    {
        _db.AuditLogs.Add(new AuditLog
        {
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            OldValues = oldValues?.ToJson(),
            NewValues = newValues?.ToJson(),
            ChangedBy = changedBy,
            ChangedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }
}
