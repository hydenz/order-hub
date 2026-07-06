using order_hub.Models;

namespace order_hub.Services;

public interface IAuditLogService
{
    Task<object> GetAllAsync(int page, int pageSize);
}
