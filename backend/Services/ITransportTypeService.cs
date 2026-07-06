using order_hub.Models;

namespace order_hub.Services;

public interface ITransportTypeService
{
    Task<List<TransportType>> GetAllAsync();
    Task<TransportType?> GetByIdAsync(int id);
    Task<TransportType> CreateAsync(TransportType transportType);
    Task<TransportType?> UpdateAsync(int id, TransportType transportType);
    Task<(bool Success, string? Error)> DeleteAsync(int id);
}
