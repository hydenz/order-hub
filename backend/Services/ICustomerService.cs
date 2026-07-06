using order_hub.Models;

namespace order_hub.Services;

public interface ICustomerService
{
    Task<List<Customer>> GetAllAsync();
    Task<Customer?> GetByIdAsync(int id);
    Task<Customer> CreateAsync(Customer customer);
    Task<Customer?> UpdateAsync(int id, Customer customer);
    Task<(bool Success, string? Error)> DeleteAsync(int id);
    Task<List<TransportType>> GetAuthorizedTransportTypesAsync(int customerId);
    Task AuthorizeTransportTypeAsync(int customerId, int transportTypeId);
    Task UnauthorizeTransportTypeAsync(int customerId, int transportTypeId);
}
