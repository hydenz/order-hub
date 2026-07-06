namespace order_hub.Services;

public interface IAuditService
{
    Task LogAsync(string entityType, int entityId, string action, object? oldValues, object? newValues, string? changedBy = "system");
}
